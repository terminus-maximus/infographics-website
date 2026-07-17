-- Object: terminus_analytics_dev.vw_data_freshness
-- Grain: One row describing raw and modeled date coverage.

CREATE OR REPLACE VIEW `terminus-maximus-analytics.terminus_analytics_dev.vw_data_freshness`
OPTIONS (description = 'Latest raw and modeled dates with refresh lag for agent-friendly monitoring.')
AS
WITH raw AS (
  SELECT
    MAX(PARSE_DATE('%Y%m%d', REGEXP_EXTRACT(table_name, r'^events_(\d{8})$'))) AS latest_raw_date
  FROM `terminus-maximus-analytics.analytics_540087863.INFORMATION_SCHEMA.TABLES`
  WHERE REGEXP_CONTAINS(table_name, r'^events_\d{8}$')
),
modeled AS (
  SELECT MAX(event_date) AS latest_modeled_date
  FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_daily_site`
  WHERE event_date BETWEEN DATE '2026-07-14' AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY)
)
SELECT
  raw.latest_raw_date,
  modeled.latest_modeled_date,
  DATE_DIFF(raw.latest_raw_date, modeled.latest_modeled_date, DAY) AS modeled_lag_days,
  DATE_DIFF(CURRENT_DATE('America/Los_Angeles'), raw.latest_raw_date, DAY) AS raw_age_days,
  CURRENT_TIMESTAMP() AS checked_at
FROM raw
CROSS JOIN modeled;
