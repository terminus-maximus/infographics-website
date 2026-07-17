-- Validation: Read the compact raw-versus-modeled freshness status.

SELECT
  latest_raw_date,
  latest_modeled_date,
  modeled_lag_days,
  raw_age_days,
  checked_at
FROM `terminus-maximus-analytics.terminus_analytics_dev.vw_data_freshness`;
