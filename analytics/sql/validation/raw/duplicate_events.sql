-- Validation: Detect duplicate exported event identity candidates.
-- A nonzero result requires inspection; tied timestamps alone are not duplicates.

SELECT
  event_date,
  user_pseudo_id,
  event_timestamp,
  event_name,
  event_bundle_sequence_id,
  batch_event_index,
  COUNT(*) AS duplicate_rows
FROM `terminus-maximus-analytics.analytics_540087863.events_*`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 7 DAY))
  AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY))
GROUP BY event_date, user_pseudo_id, event_timestamp, event_name, event_bundle_sequence_id, batch_event_index
HAVING COUNT(*) > 1
ORDER BY duplicate_rows DESC, event_date DESC;
