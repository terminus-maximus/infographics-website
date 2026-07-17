-- Validation: Confirm that non-production events remain in staging but do not enter fct_event.
-- Expected: excluded_fact_events = 0; staging_excluded_events may be greater than zero.

WITH staging AS (
  SELECT
    event_date,
    COUNTIF(NOT is_production_hostname) AS staging_excluded_events
  FROM `terminus-maximus-analytics.terminus_analytics_dev.stg_ga4_events`
  WHERE event_date BETWEEN DATE '2026-07-14'
    AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY)
  GROUP BY event_date
),
fact AS (
  SELECT
    event_date,
    COUNTIF(hostname NOT IN ('terminusmaximus.com', 'www.terminusmaximus.com') OR hostname IS NULL) AS excluded_fact_events
  FROM `terminus-maximus-analytics.terminus_analytics_dev.fct_event`
  WHERE event_date BETWEEN DATE '2026-07-14'
    AND DATE_SUB(CURRENT_DATE('America/Los_Angeles'), INTERVAL 1 DAY)
  GROUP BY event_date
)
SELECT
  staging.event_date,
  staging.staging_excluded_events,
  COALESCE(fact.excluded_fact_events, 0) AS excluded_fact_events
FROM staging
LEFT JOIN fact USING (event_date)
ORDER BY event_date;
