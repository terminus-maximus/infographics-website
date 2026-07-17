-- Object: terminus_analytics_dev.vw_tracking_anomalies
-- Grain: One row per detected date/issue combination in the recent monitoring window.

CREATE OR REPLACE VIEW `terminus-maximus-analytics.terminus_analytics_dev.vw_tracking_anomalies`
OPTIONS (description = 'Recent volume, required-event, parameter, hostname, and classification anomalies.')
AS
WITH daily AS (
  SELECT
    event_date,
    COUNT(*) AS events,
    COUNTIF(event_name = 'page_view') AS page_views,
    COUNTIF(event_name = 'session_start') AS session_starts,
    COUNTIF(event_name = 'full_resolution_infographic_open') AS infographic_opens,
    COUNTIF(event_name = 'guild_raid_youtube_click') AS legacy_replay_clicks,
    COUNTIF(event_name = 'replay_youtube_click') AS replay_clicks,
    COUNTIF(hostname IS NOT NULL AND hostname NOT IN ('terminusmaximus.com', 'www.terminusmaximus.com')) AS unexpected_hostname_events,
    COUNTIF(event_name = 'full_resolution_infographic_open' AND (infographic_title IS NULL OR infographic_url IS NULL OR link_source IS NULL OR page_path IS NULL)) AS incomplete_infographic_events,
    COUNTIF(event_name = 'replay_youtube_click' AND (video_id IS NULL OR link_url IS NULL OR page_path IS NULL)) AS incomplete_replay_clicks
  FROM `terminus-maximus-analytics.terminus_analytics_dev.stg_ga4_events`
  WHERE event_date BETWEEN DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 14 DAY)
    AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY)
  GROUP BY event_date
),
with_previous AS (
  SELECT
    *,
    LAG(events) OVER (ORDER BY event_date) AS previous_events
  FROM daily
),
issues AS (
  SELECT event_date, 'missing_page_views' AS issue_type, 'high' AS severity, page_views AS observed_value, 'Expected page_view events on a populated date.' AS detail FROM with_previous WHERE events > 0 AND page_views = 0
  UNION ALL
  SELECT event_date, 'missing_session_starts', 'high', session_starts, 'Expected session_start events on a populated date.' FROM with_previous WHERE events > 0 AND session_starts = 0
  UNION ALL
  SELECT event_date, 'event_volume_decline', 'medium', events, 'Event volume declined by more than 60% day over day.' FROM with_previous WHERE previous_events > 0 AND SAFE_DIVIDE(events, previous_events) < 0.4
  UNION ALL
  SELECT event_date, 'event_volume_spike', 'medium', events, 'Event volume increased by more than 150% day over day.' FROM with_previous WHERE previous_events > 0 AND SAFE_DIVIDE(events, previous_events) > 2.5
  UNION ALL
  SELECT event_date, 'unexpected_hostname', 'high', unexpected_hostname_events, 'Events arrived from a hostname outside the production allowlist.' FROM with_previous WHERE unexpected_hostname_events > 0
  UNION ALL
  SELECT event_date, 'incomplete_infographic_event', 'medium', incomplete_infographic_events, 'Required infographic parameters were null.' FROM with_previous WHERE incomplete_infographic_events > 0
  UNION ALL
  SELECT event_date, 'incomplete_replay_click', 'medium', incomplete_replay_clicks, 'Required replay click parameters were null.' FROM with_previous WHERE incomplete_replay_clicks > 0
)
SELECT
  event_date,
  issue_type,
  severity,
  observed_value,
  detail,
  CURRENT_TIMESTAMP() AS checked_at
FROM issues;
