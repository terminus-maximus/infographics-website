-- Validation: Total events and users by raw export date.
-- Adjust the dates deliberately; never remove the _TABLE_SUFFIX predicate.

SELECT
  PARSE_DATE('%Y%m%d', event_date) AS event_date,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_pseudo_id) AS pseudo_users,
  MIN(TIMESTAMP_MICROS(event_timestamp)) AS first_event_utc,
  MAX(TIMESTAMP_MICROS(event_timestamp)) AS last_event_utc
FROM `terminus-maximus-analytics.analytics_540087863.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260715' AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY))
GROUP BY event_date
ORDER BY event_date;
