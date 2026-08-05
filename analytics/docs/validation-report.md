# Analytics validation report

## Native raw-export coverage

Validated in BigQuery on July 16, 2026 using a query restricted to `events_20260714` and `events_20260715`.

| Reporting date | Events | Pseudo-users | Page views | Session starts | First event UTC | Last event UTC | Production-host events | Non-production-host events |
| --- | ---: | ---: | ---: | ---: | --- | --- | ---: | ---: |
| 2026-07-14 | 3,214 | 448 | 1,094 | 572 | 2026-07-14 07:00:00.332428 | 2026-07-15 06:59:38.927378 | 3,183 | 31 |
| 2026-07-15 | 2,649 | 342 | 836 | 491 | 2026-07-15 07:01:03.662639 | 2026-07-16 06:58:16.257394 | 2,649 | 0 |

### Conclusions

- July 14 spans essentially the full midnight-to-midnight Los Angeles reporting day and is the first native export date.
- The semantic layer must begin at `2026-07-14`.
- July 15 reconciles to the previously validated 2,649-event result.
- The coverage query processed approximately 435.56 KB and created or modified no resources.

## July 14 non-production hostname inventory

Validated in BigQuery on July 16, 2026 using a read-only query restricted to `events_20260714`.

| Hostname | Event name | Events | Pseudo-users |
| --- | --- | ---: | ---: |
| `localhost` | `page_view` | 8 | 1 |
| `localhost` | `user_engagement` | 7 | 1 |
| `127.0.0.1` | `page_view` | 6 | 1 |
| `127.0.0.1` | `scroll` | 4 | 1 |
| `localhost` | `scroll` | 2 | 1 |
| `127.0.0.1` | `user_engagement` | 2 | 1 |
| `localhost` | `session_start` | 1 | 1 |
| `127.0.0.1` | `session_start` | 1 | 1 |

### Conclusions

- All 31 events outside the production hostname allowlist are attributable to local development traffic.
- No unknown preview, staging, or third-party hostname was present.
- Raw and staging data must retain these events for auditability.
- Production-facing facts and metrics should include only `terminusmaximus.com` and `www.terminusmaximus.com`, while monitoring should continue to report excluded hostname counts.
- The hostname inventory query created or modified no resources.

## Development-model pre-deployment validation

Validated on July 16, 2026 without executing model SQL or creating BigQuery objects.

- The staging transformation's `SELECT` was dry-run directly against the July 14–15 raw export tables. BigQuery accepted the query and estimated 3.64 MB processed.
- The page-classification map was accepted by the validator with a 0 B estimate.
- The staging, session, and aggregate multi-statement scripts reached BigQuery's script validator. BigQuery reports that it cannot compute a bytes estimate for those scripts; it reported no syntax error.
- The complete generated refresh workflow also reached the script validator with the same no-estimate notice and no syntax error.
- Views that depend on modeled tables reached dependency resolution and reported the expected missing-table errors because the development dataset is intentionally empty:
  - `dim_page`, `fct_event`, and `vw_tracking_anomalies` require `stg_ga4_events`.
  - `fct_session` requires `int_ga4_sessions`.
  - `vw_data_freshness` requires `fct_daily_site`.
- No Run action was used. No query was executed, no bytes were billed, and no BigQuery resource was created or modified.
- Local deterministic builders passed, including 1,303 valid Replay rows with zero duplicate IDs or missing required fields.
- The Astro production build passed with 28 generated pages.

## Development deployment and reconciliation

Deployed to `terminus-maximus-analytics.terminus_analytics_dev` on July 16, 2026 after explicit owner approval.

### Objects created

Twelve expected development objects are present:

- Internal tables: `map_page_classification`, `stg_ga4_events`, and `int_ga4_sessions`
- Dimensions: `dim_page` and `dim_replay`
- Public views: `fct_event` and `fct_session`
- Aggregate tables: `fct_daily_site`, `fct_daily_page`, and `fct_traffic_acquisition`
- Monitoring views: `vw_data_freshness` and `vw_tracking_anomalies`

No production dataset, scheduled query, IAM binding, or raw GA4 table was created or modified.

### Staging reconciliation

| Reporting date | Staging events | Distinct event keys | Production events | Excluded events |
| --- | ---: | ---: | ---: | ---: |
| 2026-07-14 | 3,214 | 3,214 | 3,183 | 31 |
| 2026-07-15 | 2,649 | 2,649 | 2,649 | 0 |

Staging retained every raw event with no duplicate candidate keys. The 31 known local-development events remain auditable and are absent from public production-host facts.

### Core metric reconciliation

All modeled values matched direct production-host raw calculations:

| Date | Users | Page views | Canonical sessions | Infographic opens | Legacy replay clicks | Canonical replay clicks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026-07-14 | 446 | 1,080 | 569 | 265 | 61 | 0 |
| 2026-07-15 | 342 | 836 | 491 | 193 | 97 | 0 |

Each modeled-minus-raw difference was zero. Canonical sessions use distinct `user_pseudo_id` + `ga_session_id` keys with an observed `session_start`. During validation, four isolated first-day events had session IDs but no observed start, while one session had a duplicate start event. The model now excludes the orphan groups and counts the duplicate key once.

### Integrity checks

- Session duplicate keys: 0
- Negative session durations: 0
- Missing session identities: 0
- Replay rows: 1,303
- Replay duplicate video IDs: 0
- Replay missing required fields: 0
- Replay negative damage values: 0
- `source_exported_at` and `loaded_at` are both BigQuery `TIMESTAMP` fields.
- Latest raw date: 2026-07-15
- Latest modeled date: 2026-07-15
- Modeled lag: 0 days
- Current monitoring output: one expected medium-severity `excluded_hostname` row for the 31 July 14 local-development events

### Invalid-route classification

`/guild-raid/s106` was present on both reporting dates with 6 page views, 5 daily session-path counts, and 4 entrances. The owner confirmed that no season-106 page existed and that these requests were users probing for advance access. It is explicitly classified as `content_type = 'not_found'`, `guide_category = 'guild_raid'`, and `page_template = 'not_found'`. Its season and all publication-state flags remain null or false so the model does not imply that season-106 content existed.

After rebuilding the development page dimension and daily page fact, all 19 observed paths are classified, both `/guild-raid/s106` daily rows carry `not_found`, and its original counts remain unchanged.

### Cost evidence

The initial deployment and validation used 35 successful parent query jobs with no failures. They processed 44,522,051 bytes and billed 534,773,760 bytes after BigQuery minimum billing increments, corresponding to substantially less than $0.01 at on-demand rates.

## Production deployment and scheduled refresh

Deployed to `terminus-maximus-analytics.terminus_analytics` in the BigQuery `US` multi-region on July 17, 2026 after PR #1 was merged at commit `f4d3b56`.

### Production resources

All 12 expected semantic objects were created:

- Internal tables: `map_page_classification`, `stg_ga4_events`, and `int_ga4_sessions`
- Dimensions: `dim_page` and `dim_replay`
- Public views: `fct_event` and `fct_session`
- Aggregate tables: `fct_daily_site`, `fct_daily_page`, and `fct_traffic_acquisition`
- Monitoring views: `vw_data_freshness` and `vw_tracking_anomalies`

The deployment used the reviewed repository SQL and deterministic Replay builder output with only the target dataset changed from `terminus_analytics_dev` to `terminus_analytics`. It did not write to `analytics_540087863`.

### Production reconciliation

The production facts were compared with both `terminus_analytics_dev` and direct production-host calculations from the native GA4 export.

| Date | Users | Page views | Canonical sessions | Infographic opens | Legacy replay clicks | Canonical replay clicks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026-07-14 | 446 | 1,080 | 569 | 265 | 61 | 0 |
| 2026-07-15 | 342 | 836 | 491 | 193 | 97 | 0 |

- Production-versus-raw mismatch dates: 0
- Production-versus-development mismatch dates: 0
- Session duplicate keys: 0
- Negative session durations: 0
- Missing session identities: 0
- Replay rows: 1,303
- Replay duplicate video IDs: 0
- Replay missing required fields: 0
- Replay negative damage values: 0
- Hostname-boundary failures: 0
- Excluded staging events: 31 on July 14 and 0 on July 15
- Excluded events in the public event fact: 0 on both dates
- Unclassified pages: 0
- `/guild-raid/s106`: retained as `not_found` with no season or publication-state flags
- Monitoring output: only the expected July 14 `excluded_hostname` anomaly

### Scheduled-query configuration

- Display name: `Terminus Maximus Analytics - Daily Semantic Refresh`
- Transfer configuration: `6ac850c5-0000-274d-b8a5-582429b3b1d8`
- Schedule: daily at `20:07 UTC`
- Rebuild strategy: latest seven reporting dates
- Location: automatic selection resolved to the shared `US` location
- Destination table: none; the workflow manages its own production tables
- Failure email: enabled
- Pub/Sub notification: not configured
- Execution identity: requesting user credential
- Service account created or selected: none
- Explicit IAM bindings created: none

Saving the schedule triggered an initial run at 10:05 AM PDT on July 17, 2026; it succeeded. A separate one-time manual run was requested through the scheduled-query backfill control at 10:12:03 AM PDT; it also succeeded.

Post-run verification reported:

- Latest raw date: 2026-07-15
- Latest modeled date: 2026-07-15
- Modeled lag: 0 days
- Raw age: 2 days
- Unexpected anomalies: 0
- Production-versus-development mismatch dates: 0

### Production cost evidence

The production deployment, validation, scheduled runs, and post-run checks used eight successful parent query jobs with no failures between 16:47:50 and 17:16:13 UTC on July 17, 2026. They processed 54,599,797 bytes and billed 618,659,840 bytes after BigQuery minimum billing increments. At an illustrative on-demand rate of $6.25 per TiB, that is approximately $0.0035 and remains far below the approved $1 continuation threshold.

## Pending validation

1. Validate Replay event-to-dimension joins after canonical Replay instrumentation is deployed.
2. Validate at least three known journeys after the new tracking is deployed.
