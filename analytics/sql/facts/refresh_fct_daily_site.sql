-- Object: terminus_analytics_dev.fct_daily_site
-- Grain: One GA4 property reporting date.
-- Sources: fct_event and fct_session.
-- Update strategy: Delete and rebuild the latest seven reporting dates.

DECLARE refresh_end_date DATE DEFAULT DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY);
DECLARE refresh_start_date DATE DEFAULT GREATEST(DATE '2026-07-15', DATE_SUB(refresh_end_date, INTERVAL 6 DAY));

CREATE TABLE IF NOT EXISTS `terminus-maximus-analytics.terminus_analytics_dev.fct_daily_site` (
  event_date DATE,
  users INT64,
  new_users INT64,
  returning_users INT64,
  sessions INT64,
  engaged_sessions INT64,
  engagement_rate FLOAT64,
  page_views INT64,
  views_per_session FLOAT64,
  engagement_time_seconds FLOAT64,
  avg_engagement_seconds_per_session FLOAT64,
  outbound_clicks INT64,
  infographic_opens INT64,
  legacy_guild_raid_youtube_clicks INT64,
  replay_youtube_clicks INT64,
  replay_filter_events INT64,
  replay_zero_result_events INT64,
  refreshed_at TIMESTAMP
)
PARTITION BY event_date
OPTIONS (
  require_partition_filter = TRUE,
  description = 'Canonical site metrics at one row per Los Angeles reporting date.'
);

DELETE FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_daily_site`
WHERE event_date BETWEEN refresh_start_date AND refresh_end_date;

INSERT INTO `terminus-maximus-analytics.terminus_analytics_dev.fct_daily_site` (
  event_date, users, new_users, returning_users, sessions, engaged_sessions,
  engagement_rate, page_views, views_per_session, engagement_time_seconds,
  avg_engagement_seconds_per_session, outbound_clicks, infographic_opens,
  legacy_guild_raid_youtube_clicks, replay_youtube_clicks, replay_filter_events,
  replay_zero_result_events, refreshed_at
)
WITH event_metrics AS (
  SELECT
    event_date,
    COUNT(DISTINCT user_pseudo_id) AS users,
    COUNTIF(event_name = 'page_view') AS page_views,
    SAFE_DIVIDE(SUM(COALESCE(engagement_time_msec, 0)), 1000) AS engagement_time_seconds,
    COUNTIF(event_name = 'click' AND (outbound OR (link_host IS NOT NULL AND link_host != 'terminusmaximus.com'))) AS outbound_clicks,
    COUNTIF(event_name = 'full_resolution_infographic_open') AS infographic_opens,
    COUNTIF(event_name = 'guild_raid_youtube_click') AS legacy_guild_raid_youtube_clicks,
    COUNTIF(event_name = 'replay_youtube_click') AS replay_youtube_clicks,
    COUNTIF(event_name = 'replay_filter_apply') AS replay_filter_events,
    COUNTIF(event_name = 'replay_zero_results') AS replay_zero_result_events
  FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_event`
  WHERE event_date BETWEEN refresh_start_date AND refresh_end_date
  GROUP BY event_date
),
session_metrics AS (
  SELECT
    session_date AS event_date,
    COUNT(*) AS sessions,
    COUNTIF(engaged_session) AS engaged_sessions,
    COUNT(DISTINCT IF(is_new_user, user_pseudo_id, NULL)) AS new_users,
    COUNT(DISTINCT IF(NOT is_new_user AND ga_session_number > 1, user_pseudo_id, NULL)) AS returning_users
  FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_session`
  WHERE session_date BETWEEN refresh_start_date AND refresh_end_date
  GROUP BY session_date
)
SELECT
  event_metrics.event_date,
  event_metrics.users,
  COALESCE(session_metrics.new_users, 0),
  COALESCE(session_metrics.returning_users, 0),
  COALESCE(session_metrics.sessions, 0),
  COALESCE(session_metrics.engaged_sessions, 0),
  SAFE_DIVIDE(session_metrics.engaged_sessions, session_metrics.sessions),
  event_metrics.page_views,
  SAFE_DIVIDE(event_metrics.page_views, session_metrics.sessions),
  event_metrics.engagement_time_seconds,
  SAFE_DIVIDE(event_metrics.engagement_time_seconds, session_metrics.sessions),
  event_metrics.outbound_clicks,
  event_metrics.infographic_opens,
  event_metrics.legacy_guild_raid_youtube_clicks,
  event_metrics.replay_youtube_clicks,
  event_metrics.replay_filter_events,
  event_metrics.replay_zero_result_events,
  CURRENT_TIMESTAMP()
FROM event_metrics
LEFT JOIN session_metrics USING (event_date);
