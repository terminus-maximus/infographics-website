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

## Pending validation

1. BigQuery-compile and dry-run every development model.
2. Populate development objects and reconcile core metrics.
3. Validate page classifications and Replay dimension joins.
4. Validate at least three known journeys after the new tracking is deployed.
