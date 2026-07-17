-- Object: terminus_analytics_dev.stg_ga4_events
-- Grain: One exported GA4 event.
-- Sources: analytics_540087863.events_*
-- Update strategy: Delete and rebuild the most recent seven reporting dates.
-- Cost control: _TABLE_SUFFIX is bounded to the refresh window.

DECLARE refresh_end_date DATE DEFAULT DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY);
DECLARE refresh_start_date DATE DEFAULT GREATEST(DATE '2026-07-14', DATE_SUB(refresh_end_date, INTERVAL 6 DAY));

CREATE TABLE IF NOT EXISTS `terminus-maximus-analytics.terminus_analytics_dev.stg_ga4_events` (
  event_date DATE,
  event_timestamp TIMESTAMP,
  event_name STRING,
  event_key STRING,
  event_bundle_sequence_id INT64,
  batch_event_index INT64,
  user_pseudo_id STRING,
  ga_session_id INT64,
  ga_session_number INT64,
  session_key STRING,
  session_engaged BOOL,
  engagement_time_msec INT64,
  page_location STRING,
  page_path STRING,
  page_title STRING,
  hostname STRING,
  page_referrer STRING,
  link_url STRING,
  link_text STRING,
  link_host STRING,
  outbound BOOL,
  infographic_title STRING,
  infographic_url STRING,
  link_source STRING,
  filter_name STRING,
  filter_value STRING,
  filter_action STRING,
  result_count INT64,
  active_filter_count INT64,
  sort_order STRING,
  video_id STRING,
  creator STRING,
  boss STRING,
  tier STRING,
  team_archetype STRING,
  mow STRING,
  map STRING,
  guild_raid_season INT64,
  result_position INT64,
  session_source STRING,
  session_medium STRING,
  session_campaign STRING,
  session_campaign_content STRING,
  session_campaign_term STRING,
  first_user_source STRING,
  first_user_medium STRING,
  first_user_campaign STRING,
  device_category STRING,
  operating_system STRING,
  browser STRING,
  country STRING,
  region STRING,
  platform STRING,
  stream_id STRING,
  is_active_user BOOL,
  loaded_at TIMESTAMP
)
PARTITION BY event_date
CLUSTER BY event_name, page_path
OPTIONS (
  require_partition_filter = TRUE,
  description = 'Flattened GA4 daily export. One row per raw event; refreshes a seven-day late-arrival window.'
);

DELETE FROM `terminus-maximus-analytics.terminus_analytics_dev.stg_ga4_events`
WHERE event_date BETWEEN refresh_start_date AND refresh_end_date;

INSERT INTO `terminus-maximus-analytics.terminus_analytics_dev.stg_ga4_events` (
  event_date, event_timestamp, event_name, event_key, event_bundle_sequence_id,
  batch_event_index, user_pseudo_id, ga_session_id, ga_session_number, session_key,
  session_engaged, engagement_time_msec, page_location, page_path, page_title,
  hostname, page_referrer, link_url, link_text, link_host, outbound,
  infographic_title, infographic_url, link_source, filter_name, filter_value,
  filter_action, result_count, active_filter_count, sort_order, video_id, creator,
  boss, tier, team_archetype, mow, map, guild_raid_season, result_position,
  session_source, session_medium, session_campaign, session_campaign_content,
  session_campaign_term, first_user_source, first_user_medium, first_user_campaign,
  device_category, operating_system, browser, country, region, platform, stream_id,
  is_active_user, loaded_at
)
WITH raw AS (
  SELECT
    r.event_date,
    r.event_timestamp,
    r.event_name,
    r.event_bundle_sequence_id,
    r.batch_event_index,
    r.user_pseudo_id,
    r.device.category AS device_category,
    r.device.operating_system,
    r.device.web_info.browser,
    r.device.web_info.hostname AS device_hostname,
    r.geo.country,
    r.geo.region,
    r.platform,
    r.stream_id,
    r.is_active_user,
    r.session_traffic_source_last_click.cross_channel_campaign.source AS cross_channel_source,
    r.session_traffic_source_last_click.cross_channel_campaign.medium AS cross_channel_medium,
    r.session_traffic_source_last_click.cross_channel_campaign.campaign_name AS cross_channel_campaign,
    r.session_traffic_source_last_click.manual_campaign.source AS manual_source,
    r.session_traffic_source_last_click.manual_campaign.medium AS manual_medium,
    r.session_traffic_source_last_click.manual_campaign.campaign_name AS manual_campaign,
    r.session_traffic_source_last_click.manual_campaign.content AS manual_content,
    r.session_traffic_source_last_click.manual_campaign.term AS manual_term,
    r.collected_traffic_source.manual_source AS collected_source,
    r.collected_traffic_source.manual_medium AS collected_medium,
    r.collected_traffic_source.manual_campaign_name AS collected_campaign,
    r.collected_traffic_source.manual_content AS collected_content,
    r.collected_traffic_source.manual_term AS collected_term,
    r.traffic_source.source AS first_user_source,
    r.traffic_source.medium AS first_user_medium,
    r.traffic_source.name AS first_user_campaign,
    (
      SELECT AS STRUCT
        MAX(IF(ep.key = 'ga_session_id', ep.value.int_value, NULL)) AS ga_session_id,
        MAX(IF(ep.key = 'ga_session_number', ep.value.int_value, NULL)) AS ga_session_number,
        MAX(IF(ep.key = 'session_engaged', COALESCE(ep.value.string_value, CAST(ep.value.int_value AS STRING)), NULL)) AS session_engaged,
        MAX(IF(ep.key = 'engagement_time_msec', ep.value.int_value, NULL)) AS engagement_time_msec,
        MAX(IF(ep.key = 'page_location', ep.value.string_value, NULL)) AS page_location,
        MAX(IF(ep.key = 'page_path', ep.value.string_value, NULL)) AS explicit_page_path,
        MAX(IF(ep.key = 'page_title', ep.value.string_value, NULL)) AS page_title,
        MAX(IF(ep.key = 'page_referrer', ep.value.string_value, NULL)) AS page_referrer,
        MAX(IF(ep.key = 'link_url', ep.value.string_value, NULL)) AS link_url,
        MAX(IF(ep.key = 'link_text', ep.value.string_value, NULL)) AS link_text,
        MAX(IF(ep.key = 'link_host', ep.value.string_value, NULL)) AS link_host,
        MAX(IF(ep.key = 'outbound', COALESCE(ep.value.string_value, CAST(ep.value.int_value AS STRING)), NULL)) AS outbound,
        MAX(IF(ep.key = 'infographic_title', ep.value.string_value, NULL)) AS infographic_title,
        MAX(IF(ep.key = 'infographic_url', ep.value.string_value, NULL)) AS infographic_url,
        MAX(IF(ep.key = 'link_source', ep.value.string_value, NULL)) AS link_source,
        MAX(IF(ep.key = 'filter_name', ep.value.string_value, NULL)) AS filter_name,
        MAX(IF(ep.key = 'filter_value', ep.value.string_value, NULL)) AS filter_value,
        MAX(IF(ep.key = 'filter_action', ep.value.string_value, NULL)) AS filter_action,
        MAX(IF(ep.key = 'result_count', ep.value.int_value, NULL)) AS result_count,
        MAX(IF(ep.key = 'active_filter_count', ep.value.int_value, NULL)) AS active_filter_count,
        MAX(IF(ep.key = 'sort_order', ep.value.string_value, NULL)) AS sort_order,
        MAX(IF(ep.key = 'video_id', ep.value.string_value, NULL)) AS video_id,
        MAX(IF(ep.key = 'creator', ep.value.string_value, NULL)) AS creator,
        MAX(IF(ep.key = 'boss', ep.value.string_value, NULL)) AS boss,
        MAX(IF(ep.key = 'tier', ep.value.string_value, NULL)) AS tier,
        MAX(IF(ep.key = 'team_archetype', ep.value.string_value, NULL)) AS team_archetype,
        MAX(IF(ep.key = 'mow', ep.value.string_value, NULL)) AS mow,
        MAX(IF(ep.key = 'map', ep.value.string_value, NULL)) AS map,
        MAX(IF(ep.key = 'guild_raid_season', ep.value.int_value, NULL)) AS guild_raid_season,
        MAX(IF(ep.key = 'result_position', ep.value.int_value, NULL)) AS result_position
      FROM UNNEST(r.event_params) AS ep
    ) AS p
  FROM `terminus-maximus-analytics.analytics_540087863.events_*` AS r
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', refresh_start_date)
    AND FORMAT_DATE('%Y%m%d', refresh_end_date)
),
normalized AS (
  SELECT
    event_date,
    event_timestamp,
    event_name,
    event_bundle_sequence_id,
    batch_event_index,
    user_pseudo_id,
    device_category,
    operating_system,
    browser,
    device_hostname,
    country,
    region,
    platform,
    stream_id,
    is_active_user,
    cross_channel_source,
    cross_channel_medium,
    cross_channel_campaign,
    manual_source,
    manual_medium,
    manual_campaign,
    manual_content,
    manual_term,
    collected_source,
    collected_medium,
    collected_campaign,
    collected_content,
    collected_term,
    first_user_source,
    first_user_medium,
    first_user_campaign,
    p,
    COALESCE(
      NULLIF(p.explicit_page_path, ''),
      REGEXP_EXTRACT(p.page_location, r'^https?://[^/]+([^?#]*)')
    ) AS unnormalized_page_path
  FROM raw
)
SELECT
  PARSE_DATE('%Y%m%d', event_date),
  TIMESTAMP_MICROS(event_timestamp),
  event_name,
  TO_HEX(MD5(CONCAT(
    COALESCE(user_pseudo_id, 'unknown'), '|', CAST(event_timestamp AS STRING), '|',
    event_name, '|', CAST(COALESCE(event_bundle_sequence_id, -1) AS STRING), '|',
    CAST(COALESCE(batch_event_index, -1) AS STRING)
  ))),
  event_bundle_sequence_id,
  batch_event_index,
  user_pseudo_id,
  p.ga_session_id,
  p.ga_session_number,
  IF(user_pseudo_id IS NULL OR p.ga_session_id IS NULL, NULL, CONCAT(user_pseudo_id, '.', CAST(p.ga_session_id AS STRING))),
  p.session_engaged IN ('1', 'true'),
  p.engagement_time_msec,
  NULLIF(p.page_location, ''),
  CASE
    WHEN unnormalized_page_path IS NULL OR unnormalized_page_path = '' THEN NULL
    WHEN unnormalized_page_path = '/' THEN '/'
    ELSE REGEXP_REPLACE(unnormalized_page_path, r'/+$', '')
  END,
  NULLIF(p.page_title, ''),
  LOWER(COALESCE(NULLIF(device_hostname, ''), NET.HOST(p.page_location))),
  NULLIF(p.page_referrer, ''),
  NULLIF(p.link_url, ''),
  NULLIF(p.link_text, ''),
  LOWER(COALESCE(NULLIF(p.link_host, ''), NET.HOST(p.link_url))),
  p.outbound IN ('1', 'true'),
  NULLIF(p.infographic_title, ''),
  NULLIF(p.infographic_url, ''),
  NULLIF(p.link_source, ''),
  NULLIF(p.filter_name, ''),
  NULLIF(p.filter_value, ''),
  NULLIF(p.filter_action, ''),
  p.result_count,
  p.active_filter_count,
  NULLIF(p.sort_order, ''),
  NULLIF(p.video_id, ''),
  NULLIF(p.creator, ''),
  NULLIF(p.boss, ''),
  NULLIF(p.tier, ''),
  NULLIF(p.team_archetype, ''),
  NULLIF(p.mow, ''),
  NULLIF(p.map, ''),
  p.guild_raid_season,
  p.result_position,
  LOWER(COALESCE(
    NULLIF(cross_channel_source, '(not set)'),
    NULLIF(manual_source, '(not set)'),
    collected_source
  )),
  LOWER(COALESCE(
    NULLIF(cross_channel_medium, '(not set)'),
    NULLIF(manual_medium, '(not set)'),
    collected_medium
  )),
  LOWER(COALESCE(
    NULLIF(cross_channel_campaign, '(not set)'),
    NULLIF(manual_campaign, '(not set)'),
    collected_campaign
  )),
  LOWER(COALESCE(manual_content, collected_content)),
  LOWER(COALESCE(manual_term, collected_term)),
  LOWER(first_user_source),
  LOWER(first_user_medium),
  LOWER(first_user_campaign),
  LOWER(device_category),
  operating_system,
  browser,
  country,
  region,
  platform,
  stream_id,
  is_active_user,
  CURRENT_TIMESTAMP()
FROM normalized;
