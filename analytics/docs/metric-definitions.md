# Canonical metric definitions

All dates use the GA4 property reporting timezone, `America/Los_Angeles`. Metrics below are authoritative for Terminus Maximus BigQuery reporting.

| Metric | Business definition | Canonical SQL definition | Primary source | Known limitation / GA4 parity |
| --- | --- | --- | --- | --- |
| User | A pseudonymous browser/device active in the selected grain. | `count(distinct user_pseudo_id)` excluding null. | `fct_event` | Not a known person. May differ from GA4 reporting identity or modeled users. |
| New user | A user with a `first_visit` event in the session or reporting date. | Distinct pseudonymous users where `is_new_user`. | `fct_session` | Late/missing `first_visit` events can undercount. |
| Returning user | A user whose session number is greater than one and who is not new in the grain. | Distinct users where `ga_session_number > 1`. | `fct_session` | Cookie deletion and cross-device use create new pseudonyms. |
| Session | Events sharing `user_pseudo_id` and non-null `ga_session_id`. | `count(distinct session_key)`. | `fct_session` | Events without either key are excluded. Can differ from GA4 modeled reporting. |
| Engaged session | A session where GA4 exported `session_engaged = 1`. | Count sessions with `engaged_session`. | `fct_session` | Uses the collected GA4 flag rather than reimplementing GA4's evolving engagement rules. |
| Engagement rate | Share of sessions that are engaged. | `safe_divide(engaged_sessions, sessions)`. | Daily facts | Null when there are no sessions. |
| Page view | A collected `page_view` event on an accepted production hostname. | Count events where `event_name = 'page_view'`. | `fct_event` | Duplicate tags would inflate this; monitored separately. |
| Entrance | The first non-null page path in a session. | Count sessions grouped by `landing_page_path`. | `fct_session` | Sessions with no page event have no entrance. |
| Landing page | The canonical path of the first page event in a session. | First `page_path` ordered by event timestamp and event order. | `fct_session` | Tied timestamps use exported batch order as a deterministic tiebreaker. |
| Exit page | The canonical path of the last page event in a session. | Last `page_path` ordered by event timestamp and event order. | `fct_session` | Represents the last observed page, not a proven browser exit. Do not label it an exit count without this caveat. |
| Engagement time | Collected foreground engagement duration. | Sum `engagement_time_msec` divided by 1,000. | Events/sessions | May be absent on some events; not wall-clock session duration. |
| Outbound click | An enhanced-measurement `click` whose link host is external. | Count qualifying `click` events. | `fct_event` | Can overlap custom replay click events; never add both as one metric. |
| Infographic open | A deliberate full-resolution infographic interaction. | Count `full_resolution_infographic_open`. | `fct_event` | Historical parameter completeness is validated separately. |
| Replay filter event | One committed change to a Replay Library filter. | Count `replay_filter_apply`. | `fct_event` | Available only after the new instrumentation cutover. Range input is debounced. |
| Zero-result search | A unique committed Replay Library state that yields zero rows. | Count `replay_zero_results`. | `fct_event` | Available only after instrumentation; repeated renders of the same state are suppressed. |
| Replay YouTube click | A click from a replay presentation to its YouTube video. | Count canonical `replay_youtube_click`; legacy `guild_raid_youtube_click` is reported separately before cutover. | `fct_event` | The legacy event lacks replay-level parameters and must not be silently relabeled. |
| Replay click-through rate | Replay YouTube clicks divided by tracked replay-result impressions. | `safe_divide(youtube_clicks, impressions)`. | Future replay fact | Not produced until reliable result impressions exist; page views are not a substitute. |
| Content click-through rate | Defined only for a named content impression and click pair. | `safe_divide(content_clicks, content_impressions)`. | Future model | Not currently available; no trustworthy content-impression event exists. |
| Current-season traffic | Page views or sessions classified to the current Guild Raid season. | Filter `dim_page.is_current_season`. | Page/session facts | Depends on maintained page classification at query time. |
| Evergreen traffic | Page views or sessions on content classified `is_evergreen`. | Filter `dim_page.is_evergreen`. | Page/session facts | Classification is a business rule, not a GA4 field. |

## Historical event continuity

`guild_raid_youtube_click` remains a distinct legacy event. The planned canonical `replay_youtube_click` begins only at its production deployment cutover. Queries spanning the cutover must expose legacy and canonical counts separately unless a report explicitly requests a combined, caveated trend.
