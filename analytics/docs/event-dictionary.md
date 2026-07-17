# Canonical event and parameter dictionary

Event and parameter names use lower-case `snake_case`. Values are trimmed, stable enumerations where possible. Free-text input and personal data are prohibited.

| Event | Trigger | Required parameters | Optional parameters | Status |
| --- | --- | --- | --- | --- |
| `page_view` | GA4 page collection | `page_location`, `page_title` | `page_referrer` | Existing automatic event. |
| `click` | GA4 enhanced-measurement outbound click | `link_url`, `link_domain` or exported equivalent | `link_text`, `outbound` | Existing automatic event; can overlap custom replay clicks. |
| `full_resolution_infographic_open` | User opens a full-resolution infographic | `infographic_title`, `infographic_url`, `link_source`, `page_path` | none | Existing custom event; retained. |
| `guild_raid_youtube_click` | Legacy YouTube click on `/guild-raid*` | `link_url`, `link_host`, `page_path`, `page_title` | `link_text` | Legacy event; preserve historically and stop only at documented cutover. |
| `replay_filter_apply` | User commits one Replay Library filter change | `filter_name`, `filter_action`, `result_count`, `active_filter_count`, `page_path` | `filter_value`, `boss`, `tier`, `team_archetype`, `map` | Approved Phase 3 instrumentation. |
| `replay_zero_results` | A new committed Replay Library state produces zero results | `active_filter_count`, `page_path` | `boss`, `tier`, `team_archetype`, `map` | Approved; duplicate state emissions suppressed. |
| `replay_youtube_click` | User clicks a presented replay's YouTube URL | `video_id`, `link_url`, `creator`, `boss`, `tier`, `team_archetype`, `result_position`, `result_count`, `page_path` | `mow`, `map`, `guild_raid_season`, `link_text` | Canonical replacement for future replay clicks. |

## Parameter conventions

- `filter_name`: one of `boss`, `team_archetype`, `map`, `tier`, `minimum_damage`, `minimum_date`, `included_hero`, `excluded_hero`.
- `filter_action`: one of `set`, `clear`, `add`, `remove`.
- `filter_value`: normalized selected value; never user-entered free text.
- `result_count`: non-negative number of matching replay results after the interaction.
- `active_filter_count`: number of active filter controls, not the number of selected hero values.
- `result_position`: one-based position in the currently rendered result order.
- `guild_raid_season`: integer when known; null when the source cannot support it.
- Missing/not applicable values are omitted from collection and modeled as SQL null. Literal strings such as `unknown`, `(not set)`, or `n/a` are not sent by custom code.

Replay identifiers and filter values are BigQuery-first parameters. They do not require GA4 custom dimensions unless an owner later needs them in the GA4 interface.
