-- Terminus Maximus GA4 BigQuery investigation
-- Output contract: one row per local CSV. `rows_json` is a JSON array of
-- records and is split by analytics/replay-library-analysis/scripts/split-query-output.mjs.
-- Read-only: this statement creates no persistent or temporary BigQuery objects.
-- Raw-table scan is explicitly bounded to the verified export coverage.

WITH
raw AS (
  SELECT
    _TABLE_SUFFIX AS table_suffix,
    event_date,
    event_timestamp,
    event_name,
    event_bundle_sequence_id,
    batch_event_index,
    user_pseudo_id,
    device.category AS device_category,
    device.web_info.browser AS browser,
    LOWER(device.web_info.hostname) AS hostname,
    privacy_info.analytics_storage AS analytics_storage,
    privacy_info.ads_storage AS ads_storage,
    privacy_info.uses_transient_token AS uses_transient_token,
    LOWER(COALESCE(
      NULLIF(session_traffic_source_last_click.cross_channel_campaign.source, '(not set)'),
      NULLIF(session_traffic_source_last_click.manual_campaign.source, '(not set)'),
      collected_traffic_source.manual_source,
      '(direct)'
    )) AS session_source,
    LOWER(COALESCE(
      NULLIF(session_traffic_source_last_click.cross_channel_campaign.medium, '(not set)'),
      NULLIF(session_traffic_source_last_click.manual_campaign.medium, '(not set)'),
      collected_traffic_source.manual_medium,
      '(none)'
    )) AS session_medium,
    LOWER(COALESCE(
      NULLIF(session_traffic_source_last_click.cross_channel_campaign.campaign_name, '(not set)'),
      NULLIF(session_traffic_source_last_click.manual_campaign.campaign_name, '(not set)'),
      collected_traffic_source.manual_campaign_name,
      '(not set)'
    )) AS session_campaign,
    event_params
  FROM `terminus-maximus-analytics.analytics_540087863.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260714' AND '20260729'
),
events AS (
  SELECT
    * EXCEPT(event_params),
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_number') AS ga_session_number,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    (SELECT COALESCE(value.string_value, CAST(value.int_value AS STRING))
     FROM UNNEST(event_params) WHERE key = 'traffic_type') AS traffic_type,
    (SELECT COALESCE(value.string_value, CAST(value.int_value AS STRING))
     FROM UNNEST(event_params) WHERE key = 'debug_mode') AS debug_mode,
    event_params
  FROM raw
),
session_groups AS (
  SELECT
    user_pseudo_id,
    ga_session_id,
    CONCAT(user_pseudo_id, '|', CAST(ga_session_id AS STRING)) AS session_key,
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS first_event_date,
    MIN(event_timestamp) AS first_event_timestamp,
    MAX(event_timestamp) AS last_event_timestamp,
    COUNT(*) AS event_count,
    COUNTIF(event_name = 'session_start') AS session_start_events,
    ANY_VALUE(session_source HAVING MIN event_timestamp) AS session_source,
    ANY_VALUE(session_medium HAVING MIN event_timestamp) AS session_medium,
    ANY_VALUE(session_campaign HAVING MIN event_timestamp) AS session_campaign,
    ARRAY_AGG(hostname ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS first_hostname
  FROM events
  WHERE user_pseudo_id IS NOT NULL
    AND ga_session_id IS NOT NULL
  GROUP BY user_pseudo_id, ga_session_id
),
duplicate_groups AS (
  SELECT
    event_date,
    user_pseudo_id,
    event_timestamp,
    event_name,
    event_bundle_sequence_id,
    batch_event_index,
    COUNT(*) AS duplicate_rows
  FROM events
  GROUP BY
    event_date, user_pseudo_id, event_timestamp, event_name,
    event_bundle_sequence_id, batch_event_index
  HAVING COUNT(*) > 1
),
date_rows AS (
  SELECT
    calendar_date,
    FORMAT_DATE('%Y%m%d', calendar_date) AS expected_table_suffix,
    COUNTIF(PARSE_DATE('%Y%m%d', e.event_date) = calendar_date) AS event_count,
    COUNT(DISTINCT IF(PARSE_DATE('%Y%m%d', e.event_date) = calendar_date, e.user_pseudo_id, NULL)) AS pseudo_users,
    COUNTIF(PARSE_DATE('%Y%m%d', e.event_date) = calendar_date AND e.event_name = 'page_view') AS page_views,
    COUNTIF(PARSE_DATE('%Y%m%d', e.event_date) = calendar_date AND e.event_name = 'session_start') AS raw_session_start_events
  FROM UNNEST(GENERATE_DATE_ARRAY(DATE '2026-07-14', DATE '2026-07-29')) AS calendar_date
  LEFT JOIN events e
    ON PARSE_DATE('%Y%m%d', e.event_date) = calendar_date
  GROUP BY calendar_date
),
hostname_rows AS (
  SELECT
    COALESCE(NULLIF(hostname, ''), '(missing)') AS hostname,
    hostname IN ('terminusmaximus.com', 'www.terminusmaximus.com') AS is_production_hostname,
    COUNT(*) AS events,
    COUNTIF(event_name = 'page_view') AS page_views,
    COUNT(DISTINCT user_pseudo_id) AS pseudo_users,
    MIN(PARSE_DATE('%Y%m%d', event_date)) AS first_date,
    MAX(PARSE_DATE('%Y%m%d', event_date)) AS last_date
  FROM events
  GROUP BY hostname, is_production_hostname
),
orphan_rows AS (
  SELECT
    session_key,
    user_pseudo_id,
    ga_session_id,
    first_event_date,
    TIMESTAMP_MICROS(first_event_timestamp) AS first_event_timestamp_utc,
    TIMESTAMP_MICROS(last_event_timestamp) AS last_event_timestamp_utc,
    event_count,
    session_source,
    session_medium,
    session_campaign,
    first_hostname,
    'Excluded from official session metrics because no session_start was observed in the bounded export.' AS diagnostic_reason
  FROM session_groups
  WHERE session_start_events = 0
),
expected_custom_params AS (
  SELECT 'guild_raid_youtube_click' AS event_name, param_name
  FROM UNNEST(['link_url', 'link_text', 'link_host', 'page_path', 'page_title']) AS param_name
  UNION ALL
  SELECT 'full_resolution_infographic_open', param_name
  FROM UNNEST(['infographic_url', 'open_url', 'infographic_title', 'link_source', 'page_path', 'page_title']) AS param_name
),
custom_events AS (
  SELECT *
  FROM events
  WHERE event_name IN ('guild_raid_youtube_click', 'full_resolution_infographic_open')
),
custom_param_rows AS (
  SELECT
    x.event_name,
    x.param_name,
    COUNT(DISTINCT FORMAT(
      '%s|%d|%s|%d|%d',
      c.user_pseudo_id,
      c.event_timestamp,
      c.event_name,
      c.event_bundle_sequence_id,
      c.batch_event_index
    )) AS total_events,
    COUNT(DISTINCT IF(
      NULLIF(TRIM(COALESCE(
        ep.value.string_value,
        CAST(ep.value.int_value AS STRING),
        CAST(ep.value.double_value AS STRING),
        CAST(ep.value.float_value AS STRING)
      )), '') IS NOT NULL,
      FORMAT(
        '%s|%d|%s|%d|%d',
        c.user_pseudo_id,
        c.event_timestamp,
        c.event_name,
        c.event_bundle_sequence_id,
        c.batch_event_index
      ),
      NULL
    )) AS populated_events
  FROM expected_custom_params x
  LEFT JOIN custom_events c
    USING (event_name)
  LEFT JOIN UNNEST(c.event_params) ep
    ON ep.key = x.param_name
  GROUP BY x.event_name, x.param_name
),
user_day AS (
  SELECT
    event_date,
    user_pseudo_id,
    COUNT(*) AS events,
    COUNTIF(event_name = 'page_view') AS page_views
  FROM events
  GROUP BY event_date, user_pseudo_id
),
quality_summary AS (
  SELECT
    'terminus-maximus-analytics' AS project_id,
    'analytics_540087863' AS raw_dataset,
    'US' AS dataset_location,
    'events_YYYYMMDD' AS raw_table_pattern,
    DATE '2026-07-14' AS available_start_date,
    DATE '2026-07-29' AS available_end_date,
    16 AS available_complete_days,
    0 AS missing_dates_within_coverage,
    FALSE AS intraday_table_present,
    COUNT(*) AS total_events,
    COUNT(DISTINCT user_pseudo_id) AS pseudo_users,
    COUNTIF(user_pseudo_id IS NULL) AS events_missing_user_pseudo_id,
    COUNTIF(ga_session_id IS NULL) AS events_missing_ga_session_id,
    COUNTIF(event_name = 'page_view' AND ga_session_id IS NULL) AS page_views_missing_ga_session_id,
    (SELECT COUNT(*) FROM session_groups) AS session_keys_with_any_event,
    (SELECT COUNTIF(session_start_events > 0) FROM session_groups) AS official_session_keys_with_start,
    (SELECT COUNTIF(session_start_events = 0) FROM session_groups) AS orphan_session_keys,
    (SELECT COUNTIF(session_start_events > 1) FROM session_groups) AS session_keys_with_duplicate_starts,
    (SELECT COALESCE(SUM(session_start_events - 1), 0) FROM session_groups WHERE session_start_events > 1) AS extra_session_start_events,
    (SELECT COUNT(*) FROM duplicate_groups) AS duplicate_candidate_groups,
    (SELECT COALESCE(SUM(duplicate_rows - 1), 0) FROM duplicate_groups) AS duplicate_candidate_extra_rows,
    COUNTIF(analytics_storage = 'No') AS analytics_storage_no_events,
    COUNTIF(analytics_storage = 'Yes') AS analytics_storage_yes_events,
    COUNTIF(analytics_storage IS NULL OR analytics_storage = 'Unset') AS analytics_storage_unset_events,
    COUNTIF(traffic_type IS NOT NULL) AS events_with_traffic_type,
    COUNTIF(debug_mode IS NOT NULL) AS debug_mode_events,
    COUNTIF(hostname NOT IN ('terminusmaximus.com', 'www.terminusmaximus.com')) AS nonproduction_events,
    COUNTIF(session_source = 'test' AND session_medium = '(none)' AND session_campaign = 'qa') AS qa_campaign_events,
    COUNTIF(browser IS NULL OR browser = '') AS events_missing_browser,
    COUNTIF(device_category IS NULL OR device_category = '') AS events_missing_device_category,
    (SELECT APPROX_QUANTILES(events, 100)[OFFSET(99)] FROM user_day) AS p99_events_per_user_day,
    (SELECT MAX(events) FROM user_day) AS max_events_per_user_day,
    (SELECT MAX(page_views) FROM user_day) AS max_page_views_per_user_day
  FROM events
)
SELECT 'data_quality_summary' AS output_name,
  TO_JSON_STRING(ARRAY_AGG(q)) AS rows_json
FROM quality_summary q
UNION ALL
SELECT 'date_coverage',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    calendar_date, expected_table_suffix, event_count, pseudo_users, page_views,
    raw_session_start_events, event_count = 0 AS is_missing_date
  ) ORDER BY calendar_date))
FROM date_rows
UNION ALL
SELECT 'hostname_inventory',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    hostname, is_production_hostname, events, page_views, pseudo_users,
    first_date, last_date
  ) ORDER BY events DESC, hostname))
FROM hostname_rows
UNION ALL
SELECT 'orphan_sessions_diagnostic',
  TO_JSON_STRING(ARRAY_AGG(o ORDER BY first_event_timestamp_utc))
FROM orphan_rows o
UNION ALL
SELECT 'duplicate_event_diagnostic',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    event_date, user_pseudo_id, event_timestamp, event_name,
    event_bundle_sequence_id, batch_event_index, duplicate_rows
  ) ORDER BY duplicate_rows DESC, event_date, event_timestamp))
FROM duplicate_groups
UNION ALL
SELECT 'custom_event_parameter_quality',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    event_name,
    param_name,
    total_events,
    populated_events,
    total_events - populated_events AS missing_or_empty_events,
    ROUND(SAFE_MULTIPLY(SAFE_DIVIDE(populated_events, total_events), 100), 2) AS populated_percent,
    IF(event_name = 'full_resolution_infographic_open' AND param_name = 'open_url',
      'Not implemented; use infographic_url.',
      NULL
    ) AS implementation_note
  ) ORDER BY event_name, param_name))
FROM custom_param_rows;
