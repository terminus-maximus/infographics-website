-- Question 1: Where are Replay Library users coming from?
-- Read-only GoogleSQL. No persistent or temporary BigQuery objects are created.
-- The raw wildcard is bounded to the verified July 14-29, 2026 export.
-- Output contract: output_name + rows_json (JSON array split locally into CSVs).

WITH
windows AS (
  SELECT * FROM UNNEST([
    STRUCT(
      1 AS window_order,
      '7 days (exact)' AS window_label,
      7 AS requested_days,
      7 AS available_days,
      DATE '2026-07-23' AS requested_start_date,
      DATE '2026-07-23' AS available_start_date,
      DATE '2026-07-29' AS end_date,
      FALSE AS is_partial_window
    ),
    (
      2,
      '28 days (available 16 of requested 28)',
      28,
      16,
      DATE '2026-07-02',
      DATE '2026-07-14',
      DATE '2026-07-29',
      TRUE
    ),
    (
      3,
      '90 days (available 16 of requested 90)',
      90,
      16,
      DATE '2026-05-01',
      DATE '2026-07-14',
      DATE '2026-07-29',
      TRUE
    )
  ])
),
raw AS (
  SELECT
    _TABLE_SUFFIX AS table_suffix,
    PARSE_DATE('%Y%m%d', event_date) AS event_date,
    event_timestamp,
    event_name,
    event_bundle_sequence_id,
    batch_event_index,
    user_pseudo_id,
    LOWER(device.web_info.hostname) AS device_hostname,
    device.category AS device_category,
    device.web_info.browser AS browser,
    session_traffic_source_last_click.cross_channel_campaign.source AS cross_channel_source,
    session_traffic_source_last_click.cross_channel_campaign.medium AS cross_channel_medium,
    session_traffic_source_last_click.cross_channel_campaign.campaign_name AS cross_channel_campaign,
    session_traffic_source_last_click.manual_campaign.source AS manual_source,
    session_traffic_source_last_click.manual_campaign.medium AS manual_medium,
    session_traffic_source_last_click.manual_campaign.campaign_name AS manual_campaign,
    collected_traffic_source.manual_source AS collected_source,
    collected_traffic_source.manual_medium AS collected_medium,
    collected_traffic_source.manual_campaign_name AS collected_campaign,
    traffic_source.source AS first_user_source,
    traffic_source.medium AS first_user_medium,
    traffic_source.name AS first_user_campaign,
    event_params
  FROM `terminus-maximus-analytics.analytics_540087863.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260714' AND '20260729'
),
extracted AS (
  SELECT
    * EXCEPT(event_params),
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_number') AS ga_session_number,
    (SELECT COALESCE(value.string_value, CAST(value.int_value AS STRING))
     FROM UNNEST(event_params) WHERE key = 'session_engaged') AS session_engaged_raw,
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'engagement_time_msec') AS engagement_time_msec,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_path') AS explicit_page_path,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    COALESCE(
      NULLIF(cross_channel_source, '(not set)'),
      NULLIF(manual_source, '(not set)'),
      collected_source,
      '(direct)'
    ) AS session_source,
    COALESCE(
      NULLIF(cross_channel_medium, '(not set)'),
      NULLIF(manual_medium, '(not set)'),
      collected_medium,
      '(none)'
    ) AS session_medium,
    COALESCE(
      NULLIF(cross_channel_campaign, '(not set)'),
      NULLIF(manual_campaign, '(not set)'),
      collected_campaign,
      '(not set)'
    ) AS session_campaign
  FROM raw
),
path_ready AS (
  SELECT
    *,
    LOWER(COALESCE(NULLIF(device_hostname, ''), NET.HOST(page_location))) AS hostname,
    COALESCE(
      NULLIF(REGEXP_EXTRACT(explicit_page_path, r'^([^?#]*)'), ''),
      NULLIF(REGEXP_EXTRACT(page_location, r'^https?://[^/]+([^?#]*)'), '')
    ) AS raw_page_path,
    REGEXP_EXTRACT(page_location, r'[?]([^#]*)') AS page_query_string
  FROM extracted
),
events AS (
  SELECT
    *,
    CONCAT(user_pseudo_id, '|', CAST(ga_session_id AS STRING)) AS session_key,
    CASE
      WHEN raw_page_path IS NULL OR raw_page_path = '' THEN NULL
      WHEN raw_page_path = '/' THEN '/'
      ELSE CONCAT(REGEXP_REPLACE(raw_page_path, r'/+$', ''), '/')
    END AS page_path,
    session_engaged_raw IN ('1', 'true') AS session_engaged,
    CASE
      WHEN REGEXP_CONTAINS(LOWER(session_source), r'reddit') THEN 'Reddit'
      WHEN REGEXP_CONTAINS(LOWER(session_source), r'discord') THEN 'Discord'
      WHEN LOWER(session_source) = 'google' AND LOWER(session_medium) = 'organic' THEN 'Google organic'
      WHEN LOWER(session_source) IN ('(direct)', '(not set)', '')
        AND LOWER(session_medium) IN ('(none)', '(not set)', '') THEN 'Direct or unattributed'
      ELSE 'Other external'
    END AS normalized_acquisition_channel
  FROM path_ready
  WHERE hostname IN ('terminusmaximus.com', 'www.terminusmaximus.com')
    AND user_pseudo_id IS NOT NULL
    AND ga_session_id IS NOT NULL
    AND NOT (
      LOWER(session_source) = 'test'
      AND LOWER(session_medium) = '(none)'
      AND LOWER(session_campaign) = 'qa'
    )
),
session_rollup_pre AS (
  SELECT
    session_key,
    user_pseudo_id,
    ga_session_id,
    MIN(IF(event_name = 'session_start', event_date, NULL)) AS session_date,
    MIN(IF(event_name = 'session_start', event_timestamp, NULL)) AS session_start_timestamp,
    COUNTIF(event_name = 'session_start') AS session_start_events,
    MAX(ga_session_number) AS ga_session_number,
    LOGICAL_OR(event_name = 'first_visit') AS has_first_visit,
    LOGICAL_OR(COALESCE(session_engaged, FALSE)) AS engaged_session,
    ARRAY_AGG(session_source ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS session_source,
    ARRAY_AGG(session_medium ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS session_medium,
    ARRAY_AGG(session_campaign ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS session_campaign,
    ARRAY_AGG(normalized_acquisition_channel ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS normalized_acquisition_channel,
    ARRAY_AGG(first_user_source IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS first_user_source,
    ARRAY_AGG(first_user_medium IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS first_user_medium,
    ARRAY_AGG(first_user_campaign IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS first_user_campaign,
    ARRAY_AGG(device_category IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS device_category,
    ARRAY_AGG(browser IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS browser,
    ARRAY_AGG(IF(event_name = 'page_view', page_path, NULL) IGNORE NULLS
      ORDER BY event_timestamp, event_bundle_sequence_id, batch_event_index LIMIT 1
    )[SAFE_OFFSET(0)] AS landing_page_path,
    COUNTIF(event_name = 'page_view') AS total_session_page_views,
    COUNTIF(event_name = 'page_view' AND page_path = '/replay-library/') AS replay_page_views
  FROM events
  GROUP BY session_key, user_pseudo_id, ga_session_id
),
sessions AS (
  SELECT
    *,
    has_first_visit OR ga_session_number = 1 AS is_new_session
  FROM session_rollup_pre
  WHERE session_start_events > 0
),
official_events AS (
  SELECT e.*
  FROM events e
  INNER JOIN sessions s
    USING (session_key)
),
ordered_events AS (
  SELECT
    *,
    LAST_VALUE(IF(event_name = 'page_view', page_path, NULL) IGNORE NULLS) OVER (
      PARTITION BY session_key
      ORDER BY event_timestamp, event_bundle_sequence_id, batch_event_index, event_name
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS current_page_path
  FROM official_events
),
page_views AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY session_key
      ORDER BY event_timestamp, event_bundle_sequence_id, batch_event_index
    ) AS page_view_number,
    LAG(page_path) OVER (
      PARTITION BY session_key
      ORDER BY event_timestamp, event_bundle_sequence_id, batch_event_index
    ) AS previous_page_path,
    LEAD(page_path) OVER (
      PARTITION BY session_key
      ORDER BY event_timestamp, event_bundle_sequence_id, batch_event_index
    ) AS next_page_path
  FROM official_events
  WHERE event_name = 'page_view'
),
first_replay_entry AS (
  SELECT
    p.session_key,
    p.event_timestamp AS replay_entry_timestamp,
    p.page_location AS replay_entry_location,
    p.page_query_string AS replay_entry_query_string,
    p.page_referrer AS replay_entry_referrer,
    LOWER(NET.HOST(p.page_referrer)) AS replay_entry_referrer_host,
    p.previous_page_path,
    p.next_page_path,
    p.page_view_number,
    p.page_view_number = 1 AS replay_was_landing_page
  FROM page_views p
  WHERE p.page_path = '/replay-library/'
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY p.session_key
    ORDER BY p.event_timestamp, p.event_bundle_sequence_id, p.batch_event_index
  ) = 1
),
replay_sessions AS (
  SELECT
    s.*,
    f.replay_entry_timestamp,
    f.replay_entry_location,
    f.replay_entry_query_string,
    f.replay_entry_referrer,
    f.replay_entry_referrer_host,
    f.previous_page_path,
    f.next_page_path,
    f.replay_was_landing_page,
    CASE
      WHEN NOT f.replay_was_landing_page
        AND (
          f.previous_page_path IS NOT NULL
          OR f.replay_entry_referrer_host IN ('terminusmaximus.com', 'www.terminusmaximus.com')
        )
        THEN 'Internal navigation'
      ELSE s.normalized_acquisition_channel
    END AS normalized_entry_channel
  FROM sessions s
  INNER JOIN first_replay_entry f
    USING (session_key)
),
replay_session_windows AS (
  SELECT
    w.*,
    r.*
  FROM windows w
  INNER JOIN replay_sessions r
    ON r.session_date BETWEEN w.available_start_date AND w.end_date
),
replay_event_windows AS (
  SELECT
    w.window_order,
    w.window_label,
    e.session_key,
    e.user_pseudo_id,
    e.event_name,
    e.event_date,
    e.engagement_time_msec,
    e.current_page_path
  FROM windows w
  INNER JOIN ordered_events e
    ON e.event_date BETWEEN w.available_start_date AND w.end_date
  INNER JOIN replay_sessions r
    USING (session_key)
),
replay_user_windows AS (
  SELECT
    window_order,
    window_label,
    user_pseudo_id,
    LOGICAL_OR(is_new_session) AS is_new_user_in_window
  FROM replay_session_windows
  GROUP BY window_order, window_label, user_pseudo_id
),
window_session_metrics AS (
  SELECT
    window_order,
    window_label,
    COUNT(DISTINCT user_pseudo_id) AS users,
    COUNT(DISTINCT session_key) AS sessions,
    COUNTIF(engaged_session) AS engaged_sessions
  FROM replay_session_windows
  GROUP BY window_order, window_label
),
window_event_metrics AS (
  SELECT
    window_order,
    window_label,
    COUNTIF(event_name = 'page_view' AND current_page_path = '/replay-library/') AS views,
    SAFE_DIVIDE(
      SUM(IF(current_page_path = '/replay-library/', COALESCE(engagement_time_msec, 0), 0)),
      1000
    ) AS page_context_engagement_seconds
  FROM replay_event_windows
  GROUP BY window_order, window_label
),
window_user_metrics AS (
  SELECT
    window_order,
    window_label,
    COUNTIF(is_new_user_in_window) AS new_users,
    COUNTIF(NOT is_new_user_in_window) AS returning_users
  FROM replay_user_windows
  GROUP BY window_order, window_label
),
window_summary AS (
  SELECT
    w.window_order,
    w.window_label,
    w.requested_days,
    w.available_days,
    w.requested_start_date,
    w.available_start_date,
    w.end_date,
    w.is_partial_window,
    s.users,
    s.sessions,
    e.views,
    s.engaged_sessions,
    ROUND(SAFE_MULTIPLY(SAFE_DIVIDE(s.engaged_sessions, s.sessions), 100), 2) AS engagement_rate_percent,
    ROUND(e.page_context_engagement_seconds, 2) AS total_page_context_engagement_seconds,
    ROUND(SAFE_DIVIDE(e.page_context_engagement_seconds, s.users), 2) AS page_context_engagement_seconds_per_replay_user,
    u.new_users,
    u.returning_users
  FROM windows w
  LEFT JOIN window_session_metrics s
    USING (window_order, window_label)
  LEFT JOIN window_event_metrics e
    USING (window_order, window_label)
  LEFT JOIN window_user_metrics u
    USING (window_order, window_label)
),
session_acquisition_rows AS (
  SELECT
    window_order,
    window_label,
    normalized_acquisition_channel,
    session_source,
    session_medium,
    session_campaign,
    COUNT(DISTINCT session_key) AS sessions,
    COUNT(DISTINCT user_pseudo_id) AS users,
    SUM(replay_page_views) AS replay_page_views,
    COUNTIF(engaged_session) AS engaged_sessions
  FROM replay_session_windows
  GROUP BY
    window_order, window_label, normalized_acquisition_channel,
    session_source, session_medium, session_campaign
),
first_user_acquisition_rows AS (
  SELECT
    window_order,
    window_label,
    COALESCE(first_user_source, '(not set)') AS first_user_source,
    COALESCE(first_user_medium, '(not set)') AS first_user_medium,
    COALESCE(first_user_campaign, '(not set)') AS first_user_campaign,
    COUNT(DISTINCT user_pseudo_id) AS users,
    COUNT(DISTINCT session_key) AS sessions,
    SUM(replay_page_views) AS replay_page_views
  FROM replay_session_windows
  GROUP BY
    window_order, window_label,
    first_user_source, first_user_medium, first_user_campaign
),
entry_context_rows AS (
  SELECT
    window_order,
    window_label,
    normalized_entry_channel,
    replay_was_landing_page,
    COALESCE(previous_page_path, '(none)') AS previous_page_path,
    landing_page_path,
    COALESCE(replay_entry_referrer_host, '(missing)') AS replay_entry_referrer_host,
    COUNT(DISTINCT session_key) AS sessions,
    COUNT(DISTINCT user_pseudo_id) AS users,
    SUM(replay_page_views) AS replay_page_views
  FROM replay_session_windows
  GROUP BY
    window_order, window_label, normalized_entry_channel,
    replay_was_landing_page, previous_page_path, landing_page_path,
    replay_entry_referrer_host
),
device_browser_rows AS (
  SELECT
    window_order,
    window_label,
    COALESCE(device_category, '(not set)') AS device_category,
    COALESCE(browser, '(not set)') AS browser,
    COUNT(DISTINCT session_key) AS sessions,
    COUNT(DISTINCT user_pseudo_id) AS users,
    SUM(replay_page_views) AS replay_page_views,
    COUNTIF(engaged_session) AS engaged_sessions
  FROM replay_session_windows
  GROUP BY window_order, window_label, device_category, browser
),
session_detail_rows AS (
  SELECT
    window_order,
    window_label,
    session_date,
    session_key,
    user_pseudo_id,
    ga_session_id,
    ga_session_number,
    is_new_session,
    engaged_session,
    replay_page_views,
    total_session_page_views,
    replay_was_landing_page,
    previous_page_path,
    next_page_path,
    replay_entry_referrer,
    replay_entry_referrer_host,
    landing_page_path,
    session_source,
    session_medium,
    session_campaign,
    normalized_acquisition_channel,
    normalized_entry_channel,
    first_user_source,
    first_user_medium,
    first_user_campaign,
    device_category,
    browser
  FROM replay_session_windows
)
SELECT
  'replay_window_summary' AS output_name,
  TO_JSON_STRING(ARRAY_AGG(s ORDER BY window_order)) AS rows_json
FROM window_summary s
UNION ALL
SELECT
  'replay_session_acquisition',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    window_label,
    normalized_acquisition_channel,
    session_source,
    session_medium,
    session_campaign,
    sessions,
    users,
    replay_page_views,
    engaged_sessions
  ) ORDER BY window_order, sessions DESC, session_source, session_medium, session_campaign))
FROM session_acquisition_rows
UNION ALL
SELECT
  'replay_first_user_acquisition',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    window_label,
    first_user_source,
    first_user_medium,
    first_user_campaign,
    users,
    sessions,
    replay_page_views
  ) ORDER BY window_order, users DESC, first_user_source, first_user_medium, first_user_campaign))
FROM first_user_acquisition_rows
UNION ALL
SELECT
  'replay_entry_context',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    window_label,
    normalized_entry_channel,
    replay_was_landing_page,
    previous_page_path,
    landing_page_path,
    replay_entry_referrer_host,
    sessions,
    users,
    replay_page_views
  ) ORDER BY window_order, sessions DESC, normalized_entry_channel, previous_page_path))
FROM entry_context_rows
UNION ALL
SELECT
  'replay_device_browser',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    window_label,
    device_category,
    browser,
    sessions,
    users,
    replay_page_views,
    engaged_sessions
  ) ORDER BY window_order, sessions DESC, device_category, browser))
FROM device_browser_rows
UNION ALL
SELECT
  'replay_session_detail',
  TO_JSON_STRING(ARRAY_AGG(d ORDER BY window_order, session_date, session_key))
FROM session_detail_rows d;
