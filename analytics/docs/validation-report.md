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
- Thirty-one July 14 events came from hostnames outside the production allowlist. Those events must remain visible in staging until their hostnames are identified and an explicit inclusion/exclusion rule is approved.
- The coverage query processed approximately 435.56 KB and created or modified no resources.

## Pending validation

1. Identify the July 14 non-production hostname values and event types.
2. BigQuery-compile and dry-run every development model.
3. Populate development objects and reconcile core metrics.
4. Validate page classifications and Replay dimension joins.
5. Validate at least three known journeys after the new tracking is deployed.
