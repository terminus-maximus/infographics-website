-- Validation: Replay dimension IDs and required fields.

SELECT 'duplicate_video_id' AS test_name, COUNT(*) AS failing_groups
FROM (
  SELECT video_id
  FROM `terminus-maximus-analytics.terminus_analytics_dev.dim_replay`
  GROUP BY video_id
  HAVING COUNT(*) > 1
)
UNION ALL
SELECT 'missing_required_field', COUNT(*)
FROM `terminus-maximus-analytics.terminus_analytics_dev.dim_replay`
WHERE video_id IS NULL OR youtube_url IS NULL OR NOT is_valid_replay
UNION ALL
SELECT 'negative_damage', COUNT(*)
FROM `terminus-maximus-analytics.terminus_analytics_dev.dim_replay`
WHERE damage < 0;
