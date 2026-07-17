-- Object: terminus_analytics_dev.fct_event
-- Grain: One relevant exported analytics event.
-- Source: stg_ga4_events.
-- Strategy: Thin authorized semantic view; no nested GA4 fields are exposed.

CREATE OR REPLACE VIEW `terminus-maximus-analytics.terminus_analytics_dev.fct_event`
OPTIONS (
  description = 'Agent-friendly flattened analytics events. Includes automatic and custom events without GA4 nested records.'
)
AS
SELECT
  event_date,
  event_timestamp,
  event_name,
  event_key,
  user_pseudo_id,
  session_key,
  page_path,
  page_title,
  hostname,
  link_url,
  link_text,
  link_host,
  outbound,
  infographic_title,
  infographic_url,
  link_source,
  filter_name,
  filter_value,
  filter_action,
  result_count,
  active_filter_count,
  sort_order,
  video_id,
  creator,
  boss,
  tier,
  team_archetype,
  mow,
  map,
  guild_raid_season,
  result_position,
  device_category,
  country,
  region,
  engagement_time_msec
FROM `terminus-maximus-analytics.terminus_analytics_dev.stg_ga4_events`
WHERE event_date BETWEEN DATE '2026-07-14' AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY);
