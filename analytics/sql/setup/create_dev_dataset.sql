-- Purpose: Create the reversible Phase 3 development dataset.
-- Location: Must match the GA4 raw export in the BigQuery US multi-region.
-- Production note: Do not create terminus_analytics until Checkpoint 4 approval.

CREATE SCHEMA IF NOT EXISTS `terminus-maximus-analytics.terminus_analytics_dev`
OPTIONS (
  location = 'US',
  description = 'Development semantic layer for Terminus Maximus GA4 analytics.'
);
