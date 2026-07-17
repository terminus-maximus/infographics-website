-- Object: terminus_analytics_dev.fct_session
-- Grain: One canonical GA4 session.
-- Source: int_ga4_sessions.
-- Strategy: Public semantic view over the canonical intermediate session model.

CREATE OR REPLACE VIEW `terminus-maximus-analytics.terminus_analytics_dev.fct_session`
OPTIONS (
  description = 'Canonical session fact using user_pseudo_id plus ga_session_id and session-level acquisition.'
)
AS
SELECT
  session_date,
  session_key,
  user_pseudo_id,
  ga_session_id,
  ga_session_number,
  session_start_timestamp,
  session_end_timestamp,
  session_duration_seconds,
  landing_page_path,
  exit_page_path,
  source,
  medium,
  campaign,
  campaign_content,
  campaign_term,
  default_channel_group,
  first_user_source,
  first_user_medium,
  first_user_campaign,
  device_category,
  country,
  region,
  page_views,
  engaged_session,
  engagement_time_seconds,
  event_count,
  outbound_clicks,
  infographic_opens,
  legacy_guild_raid_youtube_clicks,
  replay_youtube_clicks,
  replay_filter_events,
  replay_zero_result_events,
  is_new_user
FROM `terminus-maximus-analytics.terminus_analytics_dev.int_ga4_sessions`
WHERE session_date BETWEEN DATE '2026-07-14' AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY);
