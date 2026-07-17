-- Object: terminus_analytics_dev.fct_traffic_acquisition
-- Grain: One reporting date + session source/medium/campaign/channel/landing page.
-- Source: fct_session.
-- Attribution: Exported session-level last click, normalized in staging.

DECLARE refresh_end_date DATE DEFAULT DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY);
DECLARE refresh_start_date DATE DEFAULT GREATEST(DATE '2026-07-15', DATE_SUB(refresh_end_date, INTERVAL 6 DAY));

CREATE TABLE IF NOT EXISTS `terminus-maximus-analytics.terminus_analytics_dev.fct_traffic_acquisition` (
  event_date DATE,
  source STRING,
  medium STRING,
  campaign STRING,
  default_channel_group STRING,
  landing_page_path STRING,
  users INT64,
  new_users INT64,
  sessions INT64,
  engaged_sessions INT64,
  engagement_rate FLOAT64,
  page_views INT64,
  infographic_opens INT64,
  legacy_guild_raid_youtube_clicks INT64,
  replay_youtube_clicks INT64,
  refreshed_at TIMESTAMP
)
PARTITION BY event_date
CLUSTER BY source, medium, campaign
OPTIONS (
  require_partition_filter = TRUE,
  description = 'Session-level acquisition performance using exported last-click attribution.'
);

DELETE FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_traffic_acquisition`
WHERE event_date BETWEEN refresh_start_date AND refresh_end_date;

INSERT INTO `terminus-maximus-analytics.terminus_analytics_dev.fct_traffic_acquisition` (
  event_date, source, medium, campaign, default_channel_group, landing_page_path,
  users, new_users, sessions, engaged_sessions, engagement_rate, page_views,
  infographic_opens, legacy_guild_raid_youtube_clicks, replay_youtube_clicks,
  refreshed_at
)
SELECT
  session_date AS event_date,
  source,
  medium,
  campaign,
  default_channel_group,
  landing_page_path,
  COUNT(DISTINCT user_pseudo_id) AS users,
  COUNT(DISTINCT IF(is_new_user, user_pseudo_id, NULL)) AS new_users,
  COUNT(*) AS sessions,
  COUNTIF(engaged_session) AS engaged_sessions,
  SAFE_DIVIDE(COUNTIF(engaged_session), COUNT(*)) AS engagement_rate,
  SUM(page_views) AS page_views,
  SUM(infographic_opens) AS infographic_opens,
  SUM(legacy_guild_raid_youtube_clicks) AS legacy_guild_raid_youtube_clicks,
  SUM(replay_youtube_clicks) AS replay_youtube_clicks,
  CURRENT_TIMESTAMP()
FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_session`
WHERE session_date BETWEEN refresh_start_date AND refresh_end_date
GROUP BY session_date, source, medium, campaign, default_channel_group, landing_page_path;
