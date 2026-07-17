# Analytics catalog for humans and AI agents

Routine questions should start with the narrowest fact table below. Query raw GA4 only for implementation debugging.

| Object | Grain | Refresh | Recommended use | Common misuse |
| --- | --- | --- | --- | --- |
| `fct_daily_site` | Date | Daily, seven-day rebuild | Trends, period comparisons, headline metrics. | Do not sum daily users to produce multi-day unique users. |
| `fct_daily_page` | Date + page | Daily, seven-day rebuild | Page and content-category performance. | Do not call last-page observations proven exits. |
| `fct_traffic_acquisition` | Date + session acquisition + landing page | Daily, seven-day rebuild | Reddit, Discord, organic, referral, and campaign session quality. | Do not interpret as first-user acquisition. |
| `fct_session` | Session | Daily, seven-day rebuild | Landing pages, session journeys, returning users, source quality. | Do not treat `session_duration_seconds` as foreground engagement. |
| `fct_event` | Event | Daily, seven-day rebuild | Custom-event parameters and event-level investigation. | Do not add generic `click` and custom replay clicks without deduplication. |
| `dim_page` | Canonical page | Daily | Stable page and content classifications. | Do not infer classification from page title when a mapped field exists. |
| `dim_replay` | Replay video | On Replay Library publication | Replay metadata and joins by `video_id`. | Do not infer Guild Raid season from publication date. |
| `vw_data_freshness` | Current state | Live view | Determine whether raw and modeled data are current. | Do not assume a one-day raw delay is permanent data loss. |
| `vw_tracking_anomalies` | Recent issue | Live view | First monitoring query for tracking health. | Zero rows are not a substitute for reconciliation. |

## Safe query rules

1. Always filter partitioned facts by their date field.
2. Use `fct_session` for multi-day unique users when a session-based population is acceptable; use `fct_event` for event-active pseudonymous users.
3. Keep `guild_raid_youtube_click` and `replay_youtube_click` separate across the instrumentation cutover.
4. Use `safe_divide` for rates.
5. State whether acquisition is session-level or first-user.
6. State that user counts are pseudonymous browser/device counts and may not match the GA4 interface exactly.
