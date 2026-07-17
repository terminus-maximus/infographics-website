-- Validation: Find raw events from non-production hostnames.

SELECT
  device.web_info.hostname AS hostname,
  COUNT(*) AS event_count,
  MIN(PARSE_DATE('%Y%m%d', event_date)) AS first_seen_date,
  MAX(PARSE_DATE('%Y%m%d', event_date)) AS last_seen_date
FROM `terminus-maximus-analytics.analytics_540087863.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260715' AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY))
GROUP BY hostname
ORDER BY event_count DESC;
