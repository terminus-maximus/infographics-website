-- Object: terminus_analytics_dev.fct_daily_page
-- Grain: One reporting date + canonical page path.
-- Sources: fct_event, fct_session, and dim_page.
-- Update strategy: Delete and rebuild the latest seven reporting dates.

DECLARE refresh_end_date DATE DEFAULT DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY);
DECLARE refresh_start_date DATE DEFAULT GREATEST(DATE '2026-07-14', DATE_SUB(refresh_end_date, INTERVAL 6 DAY));

CREATE TABLE IF NOT EXISTS `terminus-maximus-analytics.terminus_analytics_dev.fct_daily_page` (
  event_date DATE,
  page_key STRING,
  page_path STRING,
  page_title STRING,
  content_type STRING,
  guide_category STRING,
  guild_raid_season INT64,
  users INT64,
  sessions INT64,
  entrances INT64,
  page_views INT64,
  engaged_sessions INT64,
  engagement_rate FLOAT64,
  engagement_time_seconds FLOAT64,
  avg_engagement_seconds_per_session FLOAT64,
  outbound_clicks INT64,
  infographic_opens INT64,
  legacy_guild_raid_youtube_clicks INT64,
  replay_youtube_clicks INT64,
  refreshed_at TIMESTAMP
)
PARTITION BY event_date
CLUSTER BY page_path, content_type
OPTIONS (
  require_partition_filter = TRUE,
  description = 'Canonical daily page metrics at one row per reporting date and page.'
);

DELETE FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_daily_page`
WHERE event_date BETWEEN refresh_start_date AND refresh_end_date;

INSERT INTO `terminus-maximus-analytics.terminus_analytics_dev.fct_daily_page` (
  event_date, page_key, page_path, page_title, content_type, guide_category,
  guild_raid_season, users, sessions, entrances, page_views, engaged_sessions,
  engagement_rate, engagement_time_seconds, avg_engagement_seconds_per_session,
  outbound_clicks, infographic_opens, legacy_guild_raid_youtube_clicks,
  replay_youtube_clicks, refreshed_at
)
WITH page_events AS (
  SELECT
    event_date,
    page_path,
    COUNT(DISTINCT user_pseudo_id) AS users,
    COUNT(DISTINCT session_key) AS sessions,
    COUNTIF(event_name = 'page_view') AS page_views,
    SAFE_DIVIDE(SUM(COALESCE(engagement_time_msec, 0)), 1000) AS engagement_time_seconds,
    COUNTIF(event_name = 'click' AND (outbound OR (link_host IS NOT NULL AND link_host != 'terminusmaximus.com'))) AS outbound_clicks,
    COUNTIF(event_name = 'full_resolution_infographic_open') AS infographic_opens,
    COUNTIF(event_name = 'guild_raid_youtube_click') AS legacy_guild_raid_youtube_clicks,
    COUNTIF(event_name = 'replay_youtube_click') AS replay_youtube_clicks
  FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_event`
  WHERE event_date BETWEEN refresh_start_date AND refresh_end_date
    AND page_path IS NOT NULL
  GROUP BY event_date, page_path
),
page_sessions AS (
  SELECT
    event.event_date,
    event.page_path,
    COUNT(DISTINCT IF(session.engaged_session, event.session_key, NULL)) AS engaged_sessions
  FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_event` AS event
  LEFT JOIN `terminus-maximus-analytics.terminus_analytics_dev.fct_session` AS session
    ON event.session_key = session.session_key
    AND event.event_date = session.session_date
  WHERE event.event_date BETWEEN refresh_start_date AND refresh_end_date
    AND event.page_path IS NOT NULL
  GROUP BY event.event_date, event.page_path
),
entrances AS (
  SELECT
    session_date AS event_date,
    landing_page_path AS page_path,
    COUNT(*) AS entrances
  FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_session`
  WHERE session_date BETWEEN refresh_start_date AND refresh_end_date
    AND landing_page_path IS NOT NULL
  GROUP BY session_date, landing_page_path
)
SELECT
  page_events.event_date,
  page.page_key,
  page_events.page_path,
  page.page_title,
  page.content_type,
  page.guide_category,
  page.guild_raid_season,
  page_events.users,
  page_events.sessions,
  COALESCE(entrances.entrances, 0),
  page_events.page_views,
  COALESCE(page_sessions.engaged_sessions, 0),
  SAFE_DIVIDE(page_sessions.engaged_sessions, page_events.sessions),
  page_events.engagement_time_seconds,
  SAFE_DIVIDE(page_events.engagement_time_seconds, page_events.sessions),
  page_events.outbound_clicks,
  page_events.infographic_opens,
  page_events.legacy_guild_raid_youtube_clicks,
  page_events.replay_youtube_clicks,
  CURRENT_TIMESTAMP()
FROM page_events
LEFT JOIN page_sessions USING (event_date, page_path)
LEFT JOIN entrances USING (event_date, page_path)
LEFT JOIN `terminus-maximus-analytics.terminus_analytics_dev.dim_page` AS page
  ON page_events.page_path = page.canonical_page_path;
