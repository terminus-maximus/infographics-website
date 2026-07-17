-- Object: terminus_analytics_dev.dim_page
-- Grain: One observed canonical page path.
-- Sources: stg_ga4_events and map_page_classification.
-- Update strategy: Full replace from the retained staging history.

CREATE OR REPLACE TABLE `terminus-maximus-analytics.terminus_analytics_dev.dim_page`
OPTIONS (
  description = 'Observed canonical pages enriched with repository-maintained classifications.'
)
AS
WITH observed AS (
  SELECT
    page_path AS canonical_page_path,
    ARRAY_AGG(page_title IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS latest_page_title,
    MIN(event_date) AS first_seen_date,
    MAX(event_date) AS last_seen_date
  FROM `terminus-maximus-analytics.terminus_analytics_dev.stg_ga4_events`
  WHERE event_date BETWEEN DATE '2026-07-14' AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY)
    AND page_path IS NOT NULL
    AND is_production_hostname
  GROUP BY page_path
)
SELECT
  TO_HEX(MD5(observed.canonical_page_path)) AS page_key,
  observed.canonical_page_path AS page_path,
  observed.canonical_page_path,
  observed.latest_page_title AS page_title,
  COALESCE(mapping.content_name, observed.latest_page_title, observed.canonical_page_path) AS content_name,
  COALESCE(mapping.content_type, 'unclassified') AS content_type,
  COALESCE(mapping.guide_category, 'unclassified') AS guide_category,
  COALESCE(mapping.page_template, 'unclassified') AS page_template,
  mapping.guild_raid_season,
  mapping.boss_name,
  mapping.event_name,
  COALESCE(mapping.is_replay_library, FALSE) AS is_replay_library,
  COALESCE(mapping.is_current_season, FALSE) AS is_current_season,
  COALESCE(mapping.is_archive, FALSE) AS is_archive,
  COALESCE(mapping.is_evergreen, FALSE) AS is_evergreen,
  observed.first_seen_date,
  observed.last_seen_date,
  CURRENT_TIMESTAMP() AS refreshed_at
FROM observed
LEFT JOIN `terminus-maximus-analytics.terminus_analytics_dev.map_page_classification` AS mapping
  USING (canonical_page_path);
