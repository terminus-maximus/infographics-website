-- Validation: Inspect exported session-level acquisition fields.

SELECT
  LOWER(COALESCE(
    NULLIF(session_traffic_source_last_click.cross_channel_campaign.source, '(not set)'),
    NULLIF(session_traffic_source_last_click.manual_campaign.source, '(not set)'),
    collected_traffic_source.manual_source,
    '(direct)'
  )) AS source,
  LOWER(COALESCE(
    NULLIF(session_traffic_source_last_click.cross_channel_campaign.medium, '(not set)'),
    NULLIF(session_traffic_source_last_click.manual_campaign.medium, '(not set)'),
    collected_traffic_source.manual_medium,
    '(none)'
  )) AS medium,
  COUNT(*) AS events,
  COUNT(DISTINCT CONCAT(user_pseudo_id, '.', CAST((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS STRING))) AS sessions
FROM `terminus-maximus-analytics.analytics_540087863.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260714' AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY))
GROUP BY source, medium
ORDER BY sessions DESC, events DESC;
