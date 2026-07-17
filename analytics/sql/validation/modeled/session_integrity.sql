-- Validation: Canonical session keys must be unique and internally valid.

SELECT
  'duplicate_session_key' AS test_name,
  COUNT(*) AS failing_groups
FROM (
  SELECT session_key
  FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_session`
  WHERE session_date BETWEEN DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 7 DAY)
    AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY)
  GROUP BY session_key
  HAVING COUNT(*) > 1
)
UNION ALL
SELECT
  'negative_session_duration',
  COUNT(*)
FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_session`
WHERE session_date BETWEEN DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 7 DAY)
  AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY)
  AND session_duration_seconds < 0
UNION ALL
SELECT
  'missing_session_identity',
  COUNT(*)
FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_session`
WHERE session_date BETWEEN DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 7 DAY)
  AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY)
  AND (session_key IS NULL OR user_pseudo_id IS NULL OR ga_session_id IS NULL);
