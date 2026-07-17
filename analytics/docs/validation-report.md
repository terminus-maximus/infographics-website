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

### Remaining compile boundary

Full dependency-aware compilation and reconciliation require the reversible development objects to exist. Creating those objects is the next cloud-changing action and requires explicit owner approval.

## Pending validation

1. Create the approved development objects in dependency order and complete dependency-aware compilation.
2. Populate development objects and reconcile core metrics.
3. Validate page classifications and Replay dimension joins.
4. Validate at least three known journeys after the new tracking is deployed.
