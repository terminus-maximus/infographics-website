-- Validation: Important observed page paths should not remain unclassified.

SELECT
  canonical_page_path,
  page_title,
  first_seen_date,
  last_seen_date
FROM `terminus-maximus-analytics.terminus_analytics_dev.dim_page`
WHERE content_type = 'unclassified'
ORDER BY last_seen_date DESC, canonical_page_path;
