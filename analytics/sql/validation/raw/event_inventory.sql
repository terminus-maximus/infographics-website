-- Validation: Inventory event names over a bounded reporting window.

SELECT
  event_name,
  COUNT(*) AS event_count,
  COUNT(DISTINCT user_pseudo_id) AS pseudo_users
FROM `terminus-maximus-analytics.analytics_540087863.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20260715' AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY))
GROUP BY event_name
ORDER BY event_count DESC, event_name;
