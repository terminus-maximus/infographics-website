# Analytics runbook

## Environments

| Environment | Dataset | Use |
| --- | --- | --- |
| Raw | `analytics_540087863` | Immutable Google-managed GA4 export. |
| Development | `terminus_analytics_dev` | Build, test, reconcile, and review. |
| Production | `terminus_analytics` | Approved semantic layer for agents and reporting. |

All datasets are in the BigQuery `US` multi-region. Do not copy tables across regions.

## Daily operation

1. GA4 writes or updates `analytics_540087863.events_YYYYMMDD`.
2. At `20:07 UTC`, the semantic refresh rebuilds the latest seven reporting dates.
3. The refresh runs staging, session, dimension, fact, and monitoring SQL in dependency order.
4. BigQuery sends an email only if the scheduled query fails.
5. `vw_data_freshness` and `vw_tracking_anomalies` are the first diagnostic surfaces.

## Confirming freshness

Run the freshness validation query in `sql/validation/modeled/data_freshness.sql`. A healthy state has:

- latest raw reporting date no more than two calendar days behind today;
- latest modeled date equal to the latest raw date;
- no missing `page_view` or `session_start` events on a populated raw date.

Daily export arrival is not guaranteed at a precise hour for a standard GA4 property. A delayed table is not automatically data loss.

## Scheduled-query failure

1. Open BigQuery > Scheduled queries and select the semantic refresh.
2. Read the failed transfer run's query error; do not rerun blindly.
3. Confirm the raw table exists for the affected date.
4. Confirm the query remained in the `US` location.
5. Confirm the execution identity still has BigQuery Job User on the project, Data Viewer on the raw dataset, and Data Editor on the target dataset.
6. Fix SQL in the repository first, review the diff, then update the scheduled-query text.
7. Manually backfill the affected date range using the repository SQL and rerun validation.

## Updating page classifications

1. Edit the repository SQL that creates `map_page_classification`.
2. Keep one row per canonical path and use lower-case paths.
3. Run the classification validation query and resolve duplicate or unclassified important paths.
4. Deploy to development and rebuild `dim_page`.
5. Review changed page classifications before production promotion.

## Updating replay metadata

1. Update the website's canonical Replay Library JSON through its existing publishing workflow.
2. Run `node analytics/scripts/build-replay-dimension.mjs`.
3. Review the generated row count and validation summary.
4. Load the generated file into the development replay seed table using the documented schema; replace the table atomically.
5. Rebuild `dim_replay` and run replay validation.
6. Promote only after invalid IDs, duplicate IDs, and enum mismatches are zero.

The builder excludes workflow-only fields such as notes and discovery timestamps.

## Adding or changing an event

1. Add the event and parameter definitions to the measurement plan and event dictionary.
2. Use lower-case `snake_case` names and avoid free-text or personal data.
3. Add extraction fields only when a downstream question needs them.
4. Add a missing-parameter validation query.
5. Implement and test locally.
6. Present the tracking diff, historical continuity impact, and BigQuery validation plan at Checkpoint 3.
7. Deploy only after owner approval.
8. Validate the event in BigQuery after the daily export arrives.

GA4 custom dimensions are optional for BigQuery-only parameters. Create one only when the parameter must be used in the GA4 interface.

## Granting read-only agent access

The recommended future-agent permissions are:

- `roles/bigquery.jobUser` on project `terminus-maximus-analytics` so the identity can run query jobs;
- `roles/bigquery.dataViewer` on dataset `terminus_analytics` only.

Do not grant the agent access to billing, service-account administration, website deployment, or GA4 administration. Raw-dataset viewer access is unnecessary for routine analysis and should be added only for a specific debugging need.

## Billing review

- Review the $5 monthly budget and its 50%, 90%, and 100% actual-spend alerts.
- Remember that alerts do not stop queries.
- Review job history for any query that scans unexpectedly large byte volumes.
- Ensure all raw wildcard queries constrain `_TABLE_SUFFIX` and all routine modeled-table queries filter partition dates.

## Rollback

- Repository changes: revert the relevant commit; do not edit production SQL only in the console.
- Scheduled refresh: disable the transfer configuration to stop future writes.
- Development objects: safe to drop and rebuild from repository SQL.
- Production objects: keep the last validated tables until a replacement is verified; do not drop raw GA4 tables.
- Tracking: revert the website instrumentation commit and redeploy only with owner approval. Preserve the documented event cutover date.
