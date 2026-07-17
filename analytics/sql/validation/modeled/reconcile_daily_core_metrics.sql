-- Validation: Reconcile semantic daily facts to direct raw counts.
-- Expected differences: users may not match the GA4 UI reporting identity.

WITH raw AS (
  SELECT
    PARSE_DATE('%Y%m%d', event_date) AS event_date,
    COUNT(DISTINCT user_pseudo_id) AS raw_users,
    COUNTIF(event_name = 'page_view') AS raw_page_views,
    COUNTIF(event_name = 'session_start') AS raw_session_starts,
    COUNTIF(event_name = 'full_resolution_infographic_open') AS raw_infographic_opens,
    COUNTIF(event_name = 'guild_raid_youtube_click') AS raw_legacy_replay_clicks,
    COUNTIF(event_name = 'replay_youtube_click') AS raw_replay_clicks
  FROM `terminus-maximus-analytics.analytics_540087863.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 7 DAY))
    AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY))
  GROUP BY event_date
)
SELECT
  raw.event_date,
  raw.raw_users,
  modeled.users AS modeled_users,
  modeled.users - raw.raw_users AS user_difference,
  raw.raw_page_views,
  modeled.page_views AS modeled_page_views,
  modeled.page_views - raw.raw_page_views AS page_view_difference,
  raw.raw_session_starts,
  modeled.sessions AS modeled_sessions,
  modeled.sessions - raw.raw_session_starts AS session_difference,
  raw.raw_infographic_opens,
  modeled.infographic_opens AS modeled_infographic_opens,
  raw.raw_legacy_replay_clicks,
  modeled.legacy_guild_raid_youtube_clicks AS modeled_legacy_replay_clicks,
  raw.raw_replay_clicks,
  modeled.replay_youtube_clicks AS modeled_replay_clicks
FROM raw
LEFT JOIN `terminus-maximus-analytics.terminus_analytics_dev.fct_daily_site` AS modeled
  USING (event_date)
WHERE modeled.event_date BETWEEN DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 7 DAY)
  AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY)
ORDER BY raw.event_date;
