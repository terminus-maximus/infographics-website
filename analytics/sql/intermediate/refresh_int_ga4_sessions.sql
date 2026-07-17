-- Object: terminus_analytics_dev.int_ga4_sessions
-- Grain: One user_pseudo_id + ga_session_id composite session.
-- Source: terminus_analytics_dev.stg_ga4_events
-- Update strategy: Delete and rebuild sessions starting in the latest seven dates.

DECLARE refresh_end_date DATE DEFAULT DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY);
DECLARE refresh_start_date DATE DEFAULT GREATEST(DATE '2026-07-15', DATE_SUB(refresh_end_date, INTERVAL 6 DAY));

CREATE TABLE IF NOT EXISTS `terminus-maximus-analytics.terminus_analytics_dev.int_ga4_sessions` (
  session_date DATE,
  session_key STRING,
  user_pseudo_id STRING,
  ga_session_id INT64,
  ga_session_number INT64,
  session_start_timestamp TIMESTAMP,
  session_end_timestamp TIMESTAMP,
  session_duration_seconds INT64,
  landing_page_path STRING,
  exit_page_path STRING,
  source STRING,
  medium STRING,
  campaign STRING,
  campaign_content STRING,
  campaign_term STRING,
  default_channel_group STRING,
  first_user_source STRING,
  first_user_medium STRING,
  first_user_campaign STRING,
  device_category STRING,
  country STRING,
  region STRING,
  page_views INT64,
  engaged_session BOOL,
  engagement_time_seconds FLOAT64,
  event_count INT64,
  outbound_clicks INT64,
  infographic_opens INT64,
  legacy_guild_raid_youtube_clicks INT64,
  replay_youtube_clicks INT64,
  replay_filter_events INT64,
  replay_zero_result_events INT64,
  is_new_user BOOL,
  loaded_at TIMESTAMP
)
PARTITION BY session_date
CLUSTER BY source, medium, landing_page_path
OPTIONS (
  require_partition_filter = TRUE,
  description = 'Canonical GA4 sessions keyed by user_pseudo_id and ga_session_id.'
);

DELETE FROM `terminus-maximus-analytics.terminus_analytics_dev.int_ga4_sessions`
WHERE session_date BETWEEN refresh_start_date AND refresh_end_date;

INSERT INTO `terminus-maximus-analytics.terminus_analytics_dev.int_ga4_sessions` (
  session_date, session_key, user_pseudo_id, ga_session_id, ga_session_number,
  session_start_timestamp, session_end_timestamp, session_duration_seconds,
  landing_page_path, exit_page_path, source, medium, campaign, campaign_content,
  campaign_term, default_channel_group, first_user_source, first_user_medium,
  first_user_campaign, device_category, country, region, page_views, engaged_session,
  engagement_time_seconds, event_count, outbound_clicks, infographic_opens,
  legacy_guild_raid_youtube_clicks, replay_youtube_clicks, replay_filter_events,
  replay_zero_result_events, is_new_user, loaded_at
)
WITH sessions AS (
  SELECT
    MIN(event_date) AS session_date,
    session_key,
    user_pseudo_id,
    ga_session_id,
    MAX(ga_session_number) AS ga_session_number,
    MIN(event_timestamp) AS session_start_timestamp,
    MAX(event_timestamp) AS session_end_timestamp,
    TIMESTAMP_DIFF(MAX(event_timestamp), MIN(event_timestamp), SECOND) AS session_duration_seconds,
    ARRAY_AGG(IF(event_name = 'page_view', page_path, NULL) IGNORE NULLS ORDER BY event_timestamp, event_bundle_sequence_id, batch_event_index LIMIT 1)[SAFE_OFFSET(0)] AS landing_page_path,
    ARRAY_AGG(IF(event_name = 'page_view', page_path, NULL) IGNORE NULLS ORDER BY event_timestamp DESC, event_bundle_sequence_id DESC, batch_event_index DESC LIMIT 1)[SAFE_OFFSET(0)] AS exit_page_path,
    ARRAY_AGG(session_source IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS attributed_source,
    ARRAY_AGG(session_medium IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS attributed_medium,
    ARRAY_AGG(session_campaign IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS attributed_campaign,
    ARRAY_AGG(session_campaign_content IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS attributed_content,
    ARRAY_AGG(session_campaign_term IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS attributed_term,
    ARRAY_AGG(first_user_source IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS first_user_source,
    ARRAY_AGG(first_user_medium IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS first_user_medium,
    ARRAY_AGG(first_user_campaign IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS first_user_campaign,
    ARRAY_AGG(device_category IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS device_category,
    ARRAY_AGG(country IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS country,
    ARRAY_AGG(region IGNORE NULLS ORDER BY event_timestamp LIMIT 1)[SAFE_OFFSET(0)] AS region,
    COUNTIF(event_name = 'page_view') AS page_views,
    LOGICAL_OR(COALESCE(session_engaged, FALSE)) AS engaged_session,
    SAFE_DIVIDE(SUM(COALESCE(engagement_time_msec, 0)), 1000) AS engagement_time_seconds,
    COUNT(*) AS event_count,
    COUNTIF(event_name = 'click' AND (outbound OR (link_host IS NOT NULL AND link_host != 'terminusmaximus.com'))) AS outbound_clicks,
    COUNTIF(event_name = 'full_resolution_infographic_open') AS infographic_opens,
    COUNTIF(event_name = 'guild_raid_youtube_click') AS legacy_guild_raid_youtube_clicks,
    COUNTIF(event_name = 'replay_youtube_click') AS replay_youtube_clicks,
    COUNTIF(event_name = 'replay_filter_apply') AS replay_filter_events,
    COUNTIF(event_name = 'replay_zero_results') AS replay_zero_result_events,
    LOGICAL_OR(event_name = 'first_visit') AS is_new_user
  FROM `terminus-maximus-analytics.terminus_analytics_dev.stg_ga4_events`
  WHERE event_date BETWEEN DATE_SUB(refresh_start_date, INTERVAL 1 DAY) AND refresh_end_date
    AND session_key IS NOT NULL
  GROUP BY session_key, user_pseudo_id, ga_session_id
  HAVING MIN(event_date) BETWEEN refresh_start_date AND refresh_end_date
)
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
  COALESCE(attributed_source, '(direct)') AS source,
  COALESCE(attributed_medium, '(none)') AS medium,
  COALESCE(attributed_campaign, '(not set)') AS campaign,
  attributed_content AS campaign_content,
  attributed_term AS campaign_term,
  CASE
    WHEN COALESCE(attributed_source, '(direct)') = '(direct)' AND COALESCE(attributed_medium, '(none)') IN ('(none)', '(not set)') THEN 'Direct'
    WHEN REGEXP_CONTAINS(COALESCE(attributed_medium, ''), r'^(cpc|ppc|paidsearch)$') THEN 'Paid Search'
    WHEN attributed_medium = 'organic' THEN 'Organic Search'
    WHEN REGEXP_CONTAINS(COALESCE(attributed_medium, ''), r'^(paid_social|paidsocial|social_paid)$') THEN 'Paid Social'
    WHEN REGEXP_CONTAINS(COALESCE(attributed_medium, ''), r'^(social|social-network|social-media|sm)$') THEN 'Organic Social'
    WHEN attributed_medium = 'email' THEN 'Email'
    WHEN attributed_medium = 'referral' THEN 'Referral'
    ELSE 'Other'
  END AS default_channel_group,
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
  is_new_user,
  CURRENT_TIMESTAMP()
FROM sessions;
