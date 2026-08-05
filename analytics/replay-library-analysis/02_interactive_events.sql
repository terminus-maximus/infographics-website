-- Question 2: Are visitors using important interactive features?
-- Target events:
--   guild_raid_youtube_click
--   full_resolution_infographic_open
-- Read-only and bounded to events_20260714 through events_20260804.
-- `infographic_url` is the implemented field; `open_url` is validated as absent.

WITH
windows AS (
  SELECT * FROM UNNEST([
    STRUCT(1 AS window_order, '7 days (exact)' AS window_label, 7 AS requested_days,
      7 AS available_days, DATE '2026-07-29' AS available_start_date,
      DATE '2026-08-04' AS end_date, FALSE AS is_partial_window),
    (2, '28 days (available 22 of requested 28)', 28, 22,
      DATE '2026-07-14', DATE '2026-08-04', TRUE),
    (3, '90 days (available 22 of requested 90)', 90, 22,
      DATE '2026-07-14', DATE '2026-08-04', TRUE)
  ])
),
raw AS (
  SELECT
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
    event_params
  FROM `terminus-maximus-analytics.analytics_540087863.events_*`
  WHERE _TABLE_SUFFIX BETWEEN '20260714' AND '20260804'
),
extracted AS (
  SELECT
    * EXCEPT(event_params),
    (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS ga_session_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_location') AS page_location,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_path') AS explicit_page_path,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_title') AS page_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_url') AS link_url,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_text') AS link_text,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_host') AS link_host,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'infographic_url') AS infographic_url,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'open_url') AS open_url,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'infographic_title') AS infographic_title,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_source') AS link_source,
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
    ) AS session_campaign,
    event_params
  FROM raw
),
path_ready AS (
  SELECT
    *,
    LOWER(COALESCE(NULLIF(device_hostname, ''), NET.HOST(page_location))) AS hostname,
    COALESCE(
      NULLIF(REGEXP_EXTRACT(explicit_page_path, r'^([^?#]*)'), ''),
      NULLIF(REGEXP_EXTRACT(page_location, r'^https?://[^/]+([^?#]*)'), '')
    ) AS raw_page_path
  FROM extracted
),
events AS (
  SELECT
    * EXCEPT(raw_page_path),
    CONCAT(user_pseudo_id, '|', CAST(ga_session_id AS STRING)) AS session_key,
    CASE
      WHEN raw_page_path IS NULL OR raw_page_path = '' THEN NULL
      WHEN raw_page_path = '/' THEN '/'
      ELSE CONCAT(REGEXP_REPLACE(raw_page_path, r'/+$', ''), '/')
    END AS page_path,
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
session_integrity AS (
  SELECT
    session_key,
    COUNTIF(event_name = 'session_start') AS session_start_events
  FROM events
  GROUP BY session_key
),
official_sessions AS (
  SELECT session_key
  FROM session_integrity
  WHERE session_start_events > 0
),
target_events AS (
  SELECT
    e.*,
    page_path = '/replay-library/' AS occurred_on_replay_library,
    CASE
      WHEN event_name = 'guild_raid_youtube_click' THEN link_url
      WHEN event_name = 'full_resolution_infographic_open' THEN infographic_url
    END AS interaction_url,
    CASE
      WHEN event_name = 'guild_raid_youtube_click' THEN link_text
      WHEN event_name = 'full_resolution_infographic_open' THEN infographic_title
    END AS interaction_label
  FROM events e
  WHERE event_name IN ('guild_raid_youtube_click', 'full_resolution_infographic_open')
),
event_window_rows AS (
  SELECT w.*, e.*
  FROM windows w
  INNER JOIN target_events e
    ON e.event_date BETWEEN w.available_start_date AND w.end_date
),
page_rate_numerators AS (
  SELECT
    window_order,
    window_label,
    event_name,
    page_path,
    occurred_on_replay_library,
    COUNT(*) AS event_count,
    COUNT(DISTINCT user_pseudo_id) AS interacting_users
  FROM event_window_rows
  GROUP BY window_order, window_label, event_name, page_path, occurred_on_replay_library
),
page_rate_denominators AS (
  SELECT
    w.window_order,
    w.window_label,
    e.page_path,
    COUNT(*) AS page_views,
    COUNT(DISTINCT e.user_pseudo_id) AS page_users
  FROM windows w
  INNER JOIN events e
    ON e.event_date BETWEEN w.available_start_date AND w.end_date
  WHERE e.event_name = 'page_view'
    AND e.page_path IS NOT NULL
  GROUP BY w.window_order, w.window_label, e.page_path
),
page_rate_rows AS (
  SELECT
    n.window_order,
    n.window_label,
    n.event_name,
    n.page_path,
    n.occurred_on_replay_library,
    n.event_count,
    n.interacting_users,
    d.page_views,
    d.page_users,
    ROUND(SAFE_MULTIPLY(SAFE_DIVIDE(n.event_count, d.page_views), 100), 2) AS events_per_100_page_views,
    ROUND(SAFE_MULTIPLY(SAFE_DIVIDE(n.interacting_users, d.page_users), 100), 2) AS interacting_users_per_100_page_users
  FROM page_rate_numerators n
  LEFT JOIN page_rate_denominators d
    USING (window_order, window_label, page_path)
),
event_summary_rows AS (
  SELECT
    window_order,
    window_label,
    requested_days,
    available_days,
    is_partial_window,
    event_name,
    COUNT(*) AS event_count,
    COUNT(DISTINCT user_pseudo_id) AS unique_users,
    ROUND(SAFE_DIVIDE(COUNT(*), COUNT(DISTINCT user_pseudo_id)), 3) AS events_per_user,
    COUNTIF(occurred_on_replay_library) AS events_on_replay_library,
    COUNT(DISTINCT IF(occurred_on_replay_library, user_pseudo_id, NULL)) AS replay_library_interacting_users
  FROM event_window_rows
  GROUP BY
    window_order, window_label, requested_days, available_days,
    is_partial_window, event_name
),
calendar_dates AS (
  SELECT day
  FROM UNNEST(GENERATE_DATE_ARRAY(DATE '2026-07-14', DATE '2026-08-04')) AS day
),
event_names AS (
  SELECT event_name
  FROM UNNEST(['guild_raid_youtube_click', 'full_resolution_infographic_open']) AS event_name
),
daily_rows AS (
  SELECT
    d.day AS event_date,
    n.event_name,
    COUNT(t.event_timestamp) AS event_count,
    COUNT(DISTINCT t.user_pseudo_id) AS unique_users,
    COUNTIF(t.occurred_on_replay_library) AS events_on_replay_library
  FROM calendar_dates d
  CROSS JOIN event_names n
  LEFT JOIN target_events t
    ON t.event_date = d.day
    AND t.event_name = n.event_name
  GROUP BY d.day, n.event_name
),
weekly_rows AS (
  SELECT
    DATE_TRUNC(event_date, WEEK(MONDAY)) AS week_start_date,
    DATE_ADD(DATE_TRUNC(event_date, WEEK(MONDAY)), INTERVAL 6 DAY) AS week_end_date,
    GREATEST(DATE_TRUNC(event_date, WEEK(MONDAY)), DATE '2026-07-14') AS observed_start_date,
    LEAST(DATE_ADD(DATE_TRUNC(event_date, WEEK(MONDAY)), INTERVAL 6 DAY), DATE '2026-08-04') AS observed_end_date,
    DATE_DIFF(
      LEAST(DATE_ADD(DATE_TRUNC(event_date, WEEK(MONDAY)), INTERVAL 6 DAY), DATE '2026-08-04'),
      GREATEST(DATE_TRUNC(event_date, WEEK(MONDAY)), DATE '2026-07-14'),
      DAY
    ) + 1 AS available_days_in_week,
    event_name,
    SUM(event_count) AS event_count,
    SUM(events_on_replay_library) AS events_on_replay_library
  FROM daily_rows
  GROUP BY
    week_start_date, week_end_date, observed_start_date, observed_end_date,
    available_days_in_week, event_name
),
weekly_user_rows AS (
  SELECT
    DATE_TRUNC(event_date, WEEK(MONDAY)) AS week_start_date,
    event_name,
    COUNT(DISTINCT user_pseudo_id) AS unique_users
  FROM target_events
  GROUP BY week_start_date, event_name
),
content_ranking_rows AS (
  SELECT
    window_order,
    window_label,
    event_name,
    page_path,
    page_title,
    occurred_on_replay_library,
    interaction_url,
    interaction_label,
    CASE
      WHEN event_name = 'guild_raid_youtube_click' THEN link_host
      ELSE NET.HOST(infographic_url)
    END AS interaction_host,
    COUNT(*) AS event_count,
    COUNT(DISTINCT user_pseudo_id) AS unique_users
  FROM event_window_rows
  GROUP BY
    window_order, window_label, event_name, page_path, page_title,
    occurred_on_replay_library, interaction_url, interaction_label,
    interaction_host
),
event_session_acquisition_rows AS (
  SELECT
    e.window_order,
    e.window_label,
    e.event_name,
    e.normalized_acquisition_channel,
    e.session_source,
    e.session_medium,
    e.session_campaign,
    COUNT(*) AS event_count,
    COUNT(DISTINCT e.user_pseudo_id) AS unique_users,
    COUNT(DISTINCT e.session_key) AS sessions
  FROM event_window_rows e
  INNER JOIN official_sessions s
    USING (session_key)
  GROUP BY
    window_order, window_label, event_name, normalized_acquisition_channel,
    session_source, session_medium, session_campaign
),
event_device_rows AS (
  SELECT
    window_order,
    window_label,
    event_name,
    COALESCE(device_category, '(not set)') AS device_category,
    COALESCE(browser, '(not set)') AS browser,
    COUNT(*) AS event_count,
    COUNT(DISTINCT user_pseudo_id) AS unique_users
  FROM event_window_rows
  GROUP BY window_order, window_label, event_name, device_category, browser
),
expected_parameters AS (
  SELECT 'guild_raid_youtube_click' AS event_name, parameter_name
  FROM UNNEST(['link_url', 'link_text', 'link_host', 'page_path', 'page_title']) AS parameter_name
  UNION ALL
  SELECT 'full_resolution_infographic_open', parameter_name
  FROM UNNEST(['infographic_url', 'open_url', 'infographic_title', 'link_source', 'page_path', 'page_title']) AS parameter_name
),
parameter_quality_rows AS (
  SELECT
    p.event_name,
    p.parameter_name,
    COUNT(DISTINCT FORMAT(
      '%s|%d|%s|%d|%d',
      t.user_pseudo_id,
      t.event_timestamp,
      t.event_name,
      t.event_bundle_sequence_id,
      t.batch_event_index
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
        t.user_pseudo_id,
        t.event_timestamp,
        t.event_name,
        t.event_bundle_sequence_id,
        t.batch_event_index
      ),
      NULL
    )) AS populated_events
  FROM expected_parameters p
  LEFT JOIN target_events t
    USING (event_name)
  LEFT JOIN UNNEST(t.event_params) ep
    ON ep.key = p.parameter_name
  GROUP BY p.event_name, p.parameter_name
)
SELECT
  'interactive_event_summary' AS output_name,
  TO_JSON_STRING(ARRAY_AGG(s ORDER BY window_order, event_name)) AS rows_json
FROM event_summary_rows s
UNION ALL
SELECT
  'interactive_event_page_rates',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    window_label,
    event_name,
    page_path,
    occurred_on_replay_library,
    event_count,
    interacting_users,
    page_views,
    page_users,
    events_per_100_page_views,
    interacting_users_per_100_page_users
  ) ORDER BY window_order, event_name, event_count DESC, page_path))
FROM page_rate_rows
UNION ALL
SELECT
  'interactive_event_daily_trend',
  TO_JSON_STRING(ARRAY_AGG(d ORDER BY event_date, event_name))
FROM daily_rows d
UNION ALL
SELECT
  'interactive_event_weekly_trend',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    w.week_start_date,
    w.week_end_date,
    w.observed_start_date,
    w.observed_end_date,
    w.available_days_in_week,
    w.available_days_in_week < 7 AS is_partial_calendar_week,
    w.event_name,
    w.event_count,
    COALESCE(u.unique_users, 0) AS unique_users,
    w.events_on_replay_library
  ) ORDER BY w.week_start_date, w.event_name))
FROM weekly_rows w
LEFT JOIN weekly_user_rows u
  USING (week_start_date, event_name)
UNION ALL
SELECT
  'interactive_event_content_ranking',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    window_label,
    event_name,
    page_path,
    page_title,
    occurred_on_replay_library,
    interaction_url,
    interaction_label,
    interaction_host,
    event_count,
    unique_users
  ) ORDER BY window_order, event_name, event_count DESC, page_path, interaction_url))
FROM content_ranking_rows
UNION ALL
SELECT
  'interactive_event_session_acquisition',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    window_label,
    event_name,
    normalized_acquisition_channel,
    session_source,
    session_medium,
    session_campaign,
    event_count,
    unique_users,
    sessions
  ) ORDER BY window_order, event_name, event_count DESC, session_source, session_medium, session_campaign))
FROM event_session_acquisition_rows
UNION ALL
SELECT
  'interactive_event_device_browser',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    window_label,
    event_name,
    device_category,
    browser,
    event_count,
    unique_users
  ) ORDER BY window_order, event_name, event_count DESC, device_category, browser))
FROM event_device_rows
UNION ALL
SELECT
  'interactive_event_parameter_quality',
  TO_JSON_STRING(ARRAY_AGG(STRUCT(
    event_name,
    parameter_name,
    total_events,
    populated_events,
    total_events - populated_events AS missing_or_empty_events,
    ROUND(SAFE_MULTIPLY(SAFE_DIVIDE(populated_events, total_events), 100), 2) AS populated_percent,
    IF(event_name = 'full_resolution_infographic_open' AND parameter_name = 'open_url',
      'Not implemented; infographic_url is the populated production parameter.',
      NULL
    ) AS implementation_note
  ) ORDER BY event_name, parameter_name))
FROM parameter_quality_rows;
