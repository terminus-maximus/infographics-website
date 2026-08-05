-- Question 3: What happens before and after Replay Library use?
-- Primary entry = first /replay-library/ page_view in each official session.
-- A separate output retains every Replay Library page_view in sequence.
-- Read-only and bounded to events_20260714 through events_20260804.

WITH
constants AS (
  SELECT
    'Available export: 2026-07-14 to 2026-08-04 (22 days)' AS analysis_period_label,
    '/guild-raid/s105/' AS prior_guild_raid_path,
    '/guild-raid/s106/' AS current_guild_raid_as_of_report_path
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
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'page_referrer') AS page_referrer,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'link_url') AS link_url,
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
    * EXCEPT(raw_page_path),
    CONCAT(user_pseudo_id, '|', CAST(ga_session_id AS STRING)) AS session_key,
    CASE
      WHEN raw_page_path IS NULL OR raw_page_path = '' THEN NULL
      WHEN raw_page_path = '/' THEN '/'
      ELSE CONCAT(REGEXP_REPLACE(raw_page_path, r'/+$', ''), '/')
    END AS page_path
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
    user_pseudo_id,
    ga_session_id,
    MIN(IF(event_name = 'session_start', event_date, NULL)) AS session_date,
    COUNTIF(event_name = 'session_start') AS session_start_events,
    ARRAY_AGG(session_source ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS session_source,
    ARRAY_AGG(session_medium ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS session_medium,
    ARRAY_AGG(session_campaign ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS session_campaign
  FROM events
  GROUP BY session_key, user_pseudo_id, ga_session_id
),
official_sessions AS (
  SELECT *
  FROM session_integrity
  WHERE session_start_events > 0
),
official_events AS (
  SELECT e.*
  FROM events e
  INNER JOIN official_sessions s
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
page_views_pre AS (
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
page_views AS (
  SELECT
    *,
    COUNT(*) OVER (PARTITION BY session_key) AS session_page_views,
    COUNTIF(page_path = '/replay-library/') OVER (PARTITION BY session_key) AS session_replay_page_views
  FROM page_views_pre
),
replay_visits_pre AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY session_key
      ORDER BY event_timestamp, event_bundle_sequence_id, batch_event_index
    ) AS replay_visit_number,
    COUNTIF(previous_page_path IS NULL OR previous_page_path != '/replay-library/') OVER (
      PARTITION BY session_key
      ORDER BY event_timestamp, event_bundle_sequence_id, batch_event_index
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS replay_entry_number
  FROM page_views
  WHERE page_path = '/replay-library/'
),
first_replay AS (
  SELECT *
  FROM replay_visits_pre
  WHERE replay_visit_number = 1
),
replay_session_rollup AS (
  SELECT
    r.session_key,
    MAX(r.replay_visit_number) AS replay_page_views,
    MAX(r.replay_entry_number) AS replay_entries,
    MAX(r.replay_entry_number) > 1 AS returned_to_replay_after_leaving
  FROM replay_visits_pre r
  GROUP BY r.session_key
),
youtube_events AS (
  SELECT
    e.session_key,
    e.user_pseudo_id,
    e.event_date,
    e.event_timestamp,
    e.event_name,
    e.page_path AS event_page_path,
    e.current_page_path,
    e.link_url,
    f.event_timestamp AS first_replay_timestamp,
    CASE
      WHEN e.event_timestamp < f.event_timestamp THEN 'Before first Replay Library visit'
      WHEN e.current_page_path = '/replay-library/' THEN 'During Replay Library page context'
      ELSE 'After first Replay Library visit'
    END AS timing_relative_to_first_replay,
    CASE
      WHEN e.event_name = 'replay_youtube_click' THEN 'Canonical replay_youtube_click'
      WHEN e.event_name = 'guild_raid_youtube_click'
        AND e.page_path = '/replay-library/' THEN 'Legacy event on Replay Library'
      WHEN e.event_name = 'guild_raid_youtube_click'
        THEN 'Guild Raid YouTube click outside Replay Library'
    END AS click_classification,
    e.event_name = 'replay_youtube_click'
      OR (e.event_name = 'guild_raid_youtube_click' AND e.page_path = '/replay-library/')
      AS qualifies_as_replay_library_youtube_click
  FROM ordered_events e
  INNER JOIN first_replay f
    USING (session_key)
  WHERE e.event_name IN ('replay_youtube_click', 'guild_raid_youtube_click')
),
youtube_session_flags AS (
  SELECT
    session_key,
    LOGICAL_OR(qualifies_as_replay_library_youtube_click) AS had_replay_library_youtube_click,
    LOGICAL_OR(click_classification = 'Guild Raid YouTube click outside Replay Library') AS had_guild_raid_youtube_click_elsewhere,
    LOGICAL_OR(qualifies_as_replay_library_youtube_click AND timing_relative_to_first_replay = 'Before first Replay Library visit') AS replay_youtube_click_before_first_visit,
    LOGICAL_OR(qualifies_as_replay_library_youtube_click AND timing_relative_to_first_replay = 'During Replay Library page context') AS replay_youtube_click_during_page_context,
    LOGICAL_OR(qualifies_as_replay_library_youtube_click AND timing_relative_to_first_replay = 'After first Replay Library visit') AS replay_youtube_click_after_first_visit
  FROM youtube_events
  GROUP BY session_key
),
replay_sessions AS (
  SELECT
    c.analysis_period_label,
    s.session_date,
    s.session_key,
    s.user_pseudo_id,
    s.ga_session_id,
    s.session_source,
    s.session_medium,
    s.session_campaign,
    f.event_timestamp AS first_replay_timestamp,
    f.page_location AS first_replay_location,
    f.page_query_string AS first_replay_query_string,
    f.page_referrer AS first_replay_referrer,
    LOWER(NET.HOST(f.page_referrer)) AS first_replay_referrer_host,
    f.previous_page_path,
    f.next_page_path,
    f.page_view_number = 1 AS replay_was_landing_page,
    f.page_view_number > 1 AS reached_replay_through_internal_navigation,
    f.session_page_views,
    r.replay_page_views,
    r.replay_entries,
    r.returned_to_replay_after_leaving,
    f.session_page_views = 1 AS single_page_session,
    f.session_page_views > 1 AS multi_page_session,
    r.replay_page_views > 1 AS multiple_replay_views,
    COALESCE(y.had_replay_library_youtube_click, FALSE) AS had_replay_library_youtube_click,
    COALESCE(y.had_guild_raid_youtube_click_elsewhere, FALSE) AS had_guild_raid_youtube_click_elsewhere,
    COALESCE(y.replay_youtube_click_before_first_visit, FALSE) AS replay_youtube_click_before_first_visit,
    COALESCE(y.replay_youtube_click_during_page_context, FALSE) AS replay_youtube_click_during_page_context,
    COALESCE(y.replay_youtube_click_after_first_visit, FALSE) AS replay_youtube_click_after_first_visit
  FROM official_sessions s
  INNER JOIN first_replay f
    USING (session_key)
  INNER JOIN replay_session_rollup r
    USING (session_key)
  LEFT JOIN youtube_session_flags y
    USING (session_key)
  CROSS JOIN constants c
),
primary_path_rows AS (
  SELECT
    analysis_period_label,
    COALESCE(previous_page_path, '(session start)') AS previous_page_path,
    '/replay-library/' AS replay_library_path,
    COALESCE(next_page_path, '(no next page)') AS next_page_path,
    replay_was_landing_page,
    single_page_session,
    multiple_replay_views,
    had_replay_library_youtube_click,
    COUNT(DISTINCT session_key) AS sessions,
    COUNT(DISTINCT user_pseudo_id) AS users
  FROM replay_sessions
  GROUP BY
    analysis_period_label, previous_page_path, next_page_path,
    replay_was_landing_page, single_page_session, multiple_replay_views,
    had_replay_library_youtube_click
),
all_visit_rows AS (
  SELECT
    c.analysis_period_label,
    s.session_date,
    r.session_key,
    r.user_pseudo_id,
    r.ga_session_id,
    r.event_timestamp AS replay_view_timestamp,
    r.replay_visit_number,
    r.replay_entry_number,
    r.page_view_number,
    r.page_view_number = 1 AS replay_was_landing_page,
    r.previous_page_path,
    r.next_page_path,
    r.page_location,
    r.page_query_string,
    r.page_referrer,
    r.session_page_views,
    r.session_replay_page_views,
    r.replay_entry_number > 1 AS is_return_after_leaving_replay
  FROM replay_visits_pre r
  INNER JOIN official_sessions s
    USING (session_key)
  CROSS JOIN constants c
),
all_visit_path_rows AS (
  SELECT
    analysis_period_label,
    replay_visit_number,
    replay_entry_number,
    COALESCE(previous_page_path, '(session start)') AS previous_page_path,
    '/replay-library/' AS replay_library_path,
    COALESCE(next_page_path, '(no next page)') AS next_page_path,
    COUNT(*) AS replay_views,
    COUNT(DISTINCT session_key) AS sessions,
    COUNT(DISTINCT user_pseudo_id) AS users
  FROM all_visit_rows
  GROUP BY
    analysis_period_label, replay_visit_number, replay_entry_number,
    previous_page_path, next_page_path
),
segment_rows AS (
  SELECT analysis_period_label, segment_name, sessions, users
  FROM (
    SELECT analysis_period_label, 'All official Replay Library sessions' AS segment_name,
      COUNT(DISTINCT session_key) AS sessions, COUNT(DISTINCT user_pseudo_id) AS users
    FROM replay_sessions GROUP BY analysis_period_label
    UNION ALL
    SELECT analysis_period_label, 'Sessions that began on Replay Library',
      COUNT(DISTINCT IF(replay_was_landing_page, session_key, NULL)),
      COUNT(DISTINCT IF(replay_was_landing_page, user_pseudo_id, NULL))
    FROM replay_sessions GROUP BY analysis_period_label
    UNION ALL
    SELECT analysis_period_label, 'Sessions that reached Replay Library through internal navigation',
      COUNT(DISTINCT IF(reached_replay_through_internal_navigation, session_key, NULL)),
      COUNT(DISTINCT IF(reached_replay_through_internal_navigation, user_pseudo_id, NULL))
    FROM replay_sessions GROUP BY analysis_period_label
    UNION ALL
    SELECT analysis_period_label, 'Sessions with only one page view',
      COUNT(DISTINCT IF(single_page_session, session_key, NULL)),
      COUNT(DISTINCT IF(single_page_session, user_pseudo_id, NULL))
    FROM replay_sessions GROUP BY analysis_period_label
    UNION ALL
    SELECT analysis_period_label, 'Sessions with multiple Replay Library views',
      COUNT(DISTINCT IF(multiple_replay_views, session_key, NULL)),
      COUNT(DISTINCT IF(multiple_replay_views, user_pseudo_id, NULL))
    FROM replay_sessions GROUP BY analysis_period_label
    UNION ALL
    SELECT analysis_period_label, 'Sessions that returned after leaving Replay Library',
      COUNT(DISTINCT IF(returned_to_replay_after_leaving, session_key, NULL)),
      COUNT(DISTINCT IF(returned_to_replay_after_leaving, user_pseudo_id, NULL))
    FROM replay_sessions GROUP BY analysis_period_label
    UNION ALL
    SELECT analysis_period_label, 'Sessions with a qualifying Replay Library YouTube click',
      COUNT(DISTINCT IF(had_replay_library_youtube_click, session_key, NULL)),
      COUNT(DISTINCT IF(had_replay_library_youtube_click, user_pseudo_id, NULL))
    FROM replay_sessions GROUP BY analysis_period_label
    UNION ALL
    SELECT analysis_period_label, 'Sessions with guild_raid_youtube_click only outside Replay Library',
      COUNT(DISTINCT IF(had_guild_raid_youtube_click_elsewhere, session_key, NULL)),
      COUNT(DISTINCT IF(had_guild_raid_youtube_click_elsewhere, user_pseudo_id, NULL))
    FROM replay_sessions GROUP BY analysis_period_label
  )
),
exploration_long AS (
  SELECT
    r.analysis_period_label,
    r.session_key,
    r.user_pseudo_id,
    target_name,
    LOGICAL_OR(matches_target) AS explored_any_time,
    LOGICAL_OR(matches_target AND p.event_timestamp > r.first_replay_timestamp) AS explored_after_first_replay
  FROM replay_sessions r
  INNER JOIN page_views p
    USING (session_key)
  CROSS JOIN UNNEST([
    STRUCT('Boss Meta' AS target_name, p.page_path = '/guild-raid/boss-meta/' AS matches_target),
    ('Elite Campaigns', STARTS_WITH(COALESCE(p.page_path, ''), '/elite-campaigns/')),
    ('LRE pages', STARTS_WITH(COALESCE(p.page_path, ''), '/lre/')),
    ('Guild Raid Season 105', p.page_path = '/guild-raid/s105/'),
    ('Current Guild Raid as of report: Season 106', p.page_path = '/guild-raid/s106/'),
    ('Home page', p.page_path = '/')
  ])
  GROUP BY
    r.analysis_period_label, r.session_key, r.user_pseudo_id, target_name
),
exploration_rows AS (
  SELECT
    analysis_period_label,
    target_name,
    COUNT(DISTINCT IF(explored_any_time, session_key, NULL)) AS sessions_any_time,
    COUNT(DISTINCT IF(explored_after_first_replay, session_key, NULL)) AS sessions_after_first_replay,
    COUNT(DISTINCT IF(explored_any_time, user_pseudo_id, NULL)) AS users_any_time
  FROM exploration_long
  GROUP BY analysis_period_label, target_name
),
youtube_timing_rows AS (
  SELECT
    c.analysis_period_label,
    event_name,
    click_classification,
    timing_relative_to_first_replay,
    qualifies_as_replay_library_youtube_click,
    COALESCE(event_page_path, '(missing)') AS event_page_path,
    COALESCE(current_page_path, '(no page context)') AS current_page_path,
    COUNT(*) AS event_count,
    COUNT(DISTINCT session_key) AS sessions,
    COUNT(DISTINCT user_pseudo_id) AS users
  FROM youtube_events
  CROSS JOIN constants c
  GROUP BY
    c.analysis_period_label, event_name, click_classification,
    timing_relative_to_first_replay, qualifies_as_replay_library_youtube_click,
    event_page_path, current_page_path
)
SELECT
  'replay_primary_paths' AS output_name,
  TO_JSON_STRING(ARRAY_AGG(p ORDER BY sessions DESC, previous_page_path, next_page_path)) AS rows_json
FROM primary_path_rows p
UNION ALL
SELECT
  'replay_session_segments',
  TO_JSON_STRING(ARRAY_AGG(s ORDER BY
    CASE segment_name
      WHEN 'All official Replay Library sessions' THEN 1
      WHEN 'Sessions that began on Replay Library' THEN 2
      WHEN 'Sessions that reached Replay Library through internal navigation' THEN 3
      WHEN 'Sessions with only one page view' THEN 4
      WHEN 'Sessions with multiple Replay Library views' THEN 5
      WHEN 'Sessions that returned after leaving Replay Library' THEN 6
      WHEN 'Sessions with a qualifying Replay Library YouTube click' THEN 7
      ELSE 8
    END
  )) AS rows_json
FROM segment_rows s
UNION ALL
SELECT
  'replay_all_visits',
  TO_JSON_STRING(ARRAY_AGG(v ORDER BY session_date, session_key, replay_view_timestamp)) AS rows_json
FROM all_visit_rows v
UNION ALL
SELECT
  'replay_all_visit_paths',
  TO_JSON_STRING(ARRAY_AGG(v ORDER BY replay_views DESC, replay_visit_number, previous_page_path, next_page_path)) AS rows_json
FROM all_visit_path_rows v
UNION ALL
SELECT
  'replay_youtube_timing',
  TO_JSON_STRING(ARRAY_AGG(y ORDER BY event_count DESC, click_classification, timing_relative_to_first_replay)) AS rows_json
FROM youtube_timing_rows y
UNION ALL
SELECT
  'replay_exploration',
  TO_JSON_STRING(ARRAY_AGG(e ORDER BY sessions_any_time DESC, target_name)) AS rows_json
FROM exploration_rows e
UNION ALL
SELECT
  'replay_journey_session_detail',
  TO_JSON_STRING(ARRAY_AGG(r ORDER BY session_date, session_key)) AS rows_json
FROM replay_sessions r;
