# Terminus Maximus analytics

This directory contains the reproducible SQL, metadata builders, validation queries, and operating documentation for the Terminus Maximus BigQuery semantic layer.

## Data flow

```text
GA4 property 540087863
  -> analytics_540087863.events_*            immutable Google-managed raw export
  -> terminus_analytics_dev.stg_ga4_events   development flattening layer
  -> terminus_analytics_dev.int_ga4_sessions development session layer
  -> terminus_analytics_dev.dim_* / fct_*    development semantic layer
  -> terminus_analytics.dim_* / fct_*        production after owner approval
```

The raw `analytics_540087863` dataset is never modified by this project. BigQuery is the reporting system of record; GA4 remains the event collector and a reconciliation surface.

## Version 1 objects

| Object | Grain | Purpose |
| --- | --- | --- |
| `stg_ga4_events` | One exported GA4 event | Flatten commonly used event parameters once. |
| `int_ga4_sessions` | One `user_pseudo_id` + `ga_session_id` | Canonical session construction and attribution. |
| `map_page_classification` | One maintained canonical path | Stable repository-owned page metadata. |
| `dim_page` | One observed canonical path | Page classifications plus first/last seen dates. |
| `dim_replay` | One valid replay `video_id` | Replay metadata generated from the website dataset. |
| `fct_event` | One relevant analytics event | Agent-friendly event access without nested GA4 fields. |
| `fct_session` | One session | Public session fact based on `int_ga4_sessions`. |
| `fct_daily_site` | One reporting date | Canonical daily site metrics. |
| `fct_daily_page` | One reporting date + page | Canonical daily page metrics. |
| `fct_traffic_acquisition` | One date + session acquisition grouping | Session-level traffic performance. |
| `vw_data_freshness` | One row | Latest raw and modeled dates. |
| `vw_tracking_anomalies` | One row per detected issue | Compact monitoring surface for humans and agents. |

Separate `dim_content`, `dim_source`, and `dim_campaign` objects are deferred. At current scale they would duplicate page and session fields without adding stable metadata. Replay-performance facts are deferred until the approved instrumentation emits reliable replay-level events.

## Repository layout

```text
analytics/
  README.md
  docs/          architecture, definitions, catalog, and runbook
  schemas/       load schemas for repository-owned dimensions
  scripts/       deterministic metadata builders
  sql/
    setup/       dataset and mapping-table DDL
    staging/     raw-event flattening
    intermediate/session construction
    dimensions/  page and replay dimensions
    facts/       event, session, daily, and acquisition facts
    monitoring/  freshness and anomaly surfaces
    validation/  raw and modeled data checks
    scheduled/   daily refresh entrypoint
```

## Fixed conventions

- Project: `terminus-maximus-analytics`
- Raw dataset: `analytics_540087863`
- Development dataset: `terminus_analytics_dev`
- Production dataset: `terminus_analytics`
- Dataset location: `US`
- Reporting timezone: `America/Los_Angeles`
- Native export begins: `2026-07-15`
- Scheduled refresh lookback: seven reporting dates
- SQL dialect: BigQuery GoogleSQL

See [architecture.md](docs/architecture.md), [metric-definitions.md](docs/metric-definitions.md), and [runbook.md](docs/runbook.md) before deploying or changing a model.
