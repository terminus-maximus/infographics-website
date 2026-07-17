# Semantic-layer data dictionary

## `stg_ga4_events`

Internal table. Grain: one exported GA4 event. Partition: `event_date`. Cluster: `event_name`, `page_path`.

| Field group | Important fields | Meaning |
| --- | --- | --- |
| Identity | `event_key`, `event_name`, `event_timestamp` | Deterministic event candidate key, collected name, and UTC timestamp. |
| User/session | `user_pseudo_id`, `ga_session_id`, `ga_session_number`, `session_key`, `session_engaged` | Pseudonymous browser identity and exported GA4 session parameters. |
| Page | `page_location`, `page_path`, `page_title`, `hostname`, `is_production_hostname`, `page_referrer` | Normalized page context. Query strings and fragments are excluded from `page_path`; the Boolean flag applies the maintained production-hostname allowlist. |
| Links | `link_url`, `link_text`, `link_host`, `outbound` | Enhanced-measurement and custom link context. |
| Infographic | `infographic_title`, `infographic_url`, `link_source` | Parameters for `full_resolution_infographic_open`. |
| Replay filters | `filter_name`, `filter_value`, `filter_action`, `result_count`, `active_filter_count`, `sort_order` | Planned Replay Library interaction parameters. |
| Replay result | `video_id`, `creator`, `boss`, `tier`, `team_archetype`, `mow`, `map`, `guild_raid_season`, `result_position` | Planned canonical replay-click parameters. |
| Acquisition | `session_source`, `session_medium`, `session_campaign`, `session_campaign_content`, `session_campaign_term` | Session-level last-click fields. |
| First user | `first_user_source`, `first_user_medium`, `first_user_campaign` | First-user acquisition; never substituted for session attribution. |
| Context | `device_category`, `operating_system`, `browser`, `country`, `region`, `platform`, `stream_id` | Exported device, geography, platform, and stream context. |

## `int_ga4_sessions` / `fct_session`

Grain: one non-null `user_pseudo_id` + `ga_session_id` with an observed `session_start`, collected on an accepted production hostname. Duplicate start events sharing the same composite key remain one session. Partition: `session_date`. The public `fct_session` view exposes the canonical intermediate columns without implementation-only timestamps.

Important fields:

- `session_key`: composite pseudonymous session identifier.
- `session_start_timestamp`, `session_end_timestamp`: first and last observed event timestamps.
- `session_duration_seconds`: observed span; not GA4 engagement time.
- `landing_page_path`, `exit_page_path`: first and last observed page-view paths.
- `source`, `medium`, `campaign`, `default_channel_group`: canonical session acquisition.
- `engaged_session`: exported GA4 engagement flag rolled up to the session.
- `engagement_time_seconds`: sum of collected foreground engagement.
- event counters: session-contained page views, outbound clicks, infographic opens, legacy replay clicks, canonical replay clicks, filter events, and zero-result events.

## `map_page_classification`

Grain: one maintained canonical path. This is repository-owned business metadata, not observed GA4 data. It defines `content_type`, `guide_category`, page template, season, archive/current-season flags, and evergreen status.

Known requests for routes that do not exist may be mapped with `content_type = 'not_found'`. Those visits remain in site and event metrics but can be separated from published-content performance. A requested season number stays null unless actual season content existed.

## `dim_page`

Grain: one canonical path observed on an accepted production hostname.

| Field | Meaning |
| --- | --- |
| `page_key` | MD5-derived stable key of the canonical path. |
| `canonical_page_path` | Normalized path used for joins. |
| `content_name` | Maintained display name, falling back to latest title/path. |
| `content_type`, `guide_category`, `page_template` | Maintained reporting classifications; `unclassified` exposes gaps. |
| `guild_raid_season`, `boss_name`, `event_name` | Optional content-specific classifications. |
| `is_replay_library`, `is_current_season`, `is_archive`, `is_evergreen` | Maintained business flags. |
| `first_seen_date`, `last_seen_date` | Observed modeled coverage. |

## `dim_replay`

Grain: one valid `video_id` from the canonical Replay Library export. The deterministic builder excludes non-valid rows and private workflow notes, then emits both a reviewable CSV and self-contained BigQuery SQL. `source_exported_at` preserves the manifest timestamp and `loaded_at` records the table rebuild. `guild_raid_season` remains null because the current source does not contain a trustworthy season field.

## `fct_event`

Grain: one analytics event collected on an accepted production hostname. This public view exposes flattened event, page, infographic, filter, and replay fields. It intentionally retains automatic production events so agents can inspect the full collected production inventory without raw nested records. Events from other hostnames remain available in staging for auditability.

## `fct_daily_site`

Grain: one reporting date. Partition: `event_date`. Contains canonical user, session, engagement, page-view, outbound-click, infographic, replay-click, filter, and zero-result metrics. Legacy and canonical replay-click counts remain separate.

## `fct_daily_page`

Grain: one reporting date + canonical page. Partition: `event_date`; cluster: `page_path`, `content_type`. Page engagement seconds are divided by sessions for the average. `engaged_sessions` means sessions touching that page that carried the exported engaged flag.

## `fct_traffic_acquisition`

Grain: one reporting date + session source + medium + campaign + channel + landing page. Partition: `event_date`; cluster: `source`, `medium`, `campaign`. This is session-level acquisition, not first-user acquisition.

## Monitoring views

- `vw_data_freshness`: latest raw and modeled dates plus lag.
- `vw_tracking_anomalies`: recent volume, missing-event, hostname, and parameter issues. A zero-row result means no configured anomaly was detected; it does not prove all tracking is correct.
