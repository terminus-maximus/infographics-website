-- Object: terminus_analytics_dev.map_page_classification
-- Grain: One row per maintained canonical page path.
-- Source: Repository routes and content metadata.
-- Update strategy: Replace atomically after a reviewed repository change.

CREATE OR REPLACE TABLE `terminus-maximus-analytics.terminus_analytics_dev.map_page_classification`
OPTIONS (
  description = 'Repository-maintained canonical page classifications. Unmapped observed paths remain visible as unclassified.'
)
AS
SELECT
  canonical_page_path,
  content_name,
  content_type,
  guide_category,
  page_template,
  guild_raid_season,
  boss_name,
  event_name,
  is_replay_library,
  is_current_season,
  is_archive,
  is_evergreen
FROM UNNEST([
  STRUCT('/' AS canonical_page_path, 'Home' AS content_name, 'home' AS content_type, 'site' AS guide_category, 'home' AS page_template, CAST(NULL AS INT64) AS guild_raid_season, CAST(NULL AS STRING) AS boss_name, CAST(NULL AS STRING) AS event_name, FALSE AS is_replay_library, FALSE AS is_current_season, FALSE AS is_archive, TRUE AS is_evergreen),
  ('/about', 'About', 'about', 'site', 'standard_page', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/feedback', 'Feedback', 'utility', 'site', 'form_page', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/beginner-guide', 'Beginner Guide', 'guide', 'beginner', 'featured_infographic', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/elite-campaigns', 'Elite Campaigns', 'guide', 'campaign', 'featured_infographic', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/campaign-event', 'Campaign Event', 'guide', 'event', 'featured_infographic', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/event-campaign', 'Event Campaign', 'guide', 'event', 'featured_infographic', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/events', 'Events', 'category', 'event', 'category_landing', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/hre', 'Hero Release Events', 'guide', 'event', 'featured_infographic', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/incursion-mow', 'Incursion and Machine of War', 'guide', 'event', 'featured_infographic', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/lre', 'Legendary Release Events', 'category', 'legendary_release_event', 'category_landing', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/lre/farsight', 'Farsight LRE', 'guide', 'legendary_release_event', 'featured_infographic', NULL, NULL, 'farsight', FALSE, FALSE, FALSE, TRUE),
  ('/lre/lucius', 'Lucius LRE', 'guide', 'legendary_release_event', 'featured_infographic', NULL, NULL, 'lucius', FALSE, FALSE, FALSE, TRUE),
  ('/lre/uthar', 'Uthar LRE', 'guide', 'legendary_release_event', 'featured_infographic', NULL, NULL, 'uthar', FALSE, FALSE, FALSE, TRUE),
  ('/guild-raid', 'Guild Raid', 'category', 'guild_raid', 'category_landing', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/guild-raid/archive', 'Guild Raid Archive', 'archive', 'guild_raid', 'archive_page', NULL, NULL, NULL, FALSE, FALSE, TRUE, TRUE),
  ('/guild-raid/boss-meta', 'Boss Meta Guide', 'guide', 'guild_raid', 'boss_meta', NULL, NULL, NULL, FALSE, FALSE, FALSE, TRUE),
  ('/guild-raid/s097', 'Guild Raid Season 97', 'season', 'guild_raid', 'guild_raid_season', 97, NULL, NULL, FALSE, FALSE, TRUE, FALSE),
  ('/guild-raid/s098', 'Guild Raid Season 98', 'season', 'guild_raid', 'guild_raid_season', 98, NULL, NULL, FALSE, FALSE, TRUE, FALSE),
  ('/guild-raid/s099', 'Guild Raid Season 99', 'season', 'guild_raid', 'guild_raid_season', 99, NULL, NULL, FALSE, FALSE, TRUE, FALSE),
  ('/guild-raid/s100', 'Guild Raid Season 100', 'season', 'guild_raid', 'guild_raid_season', 100, NULL, NULL, FALSE, FALSE, TRUE, FALSE),
  ('/guild-raid/s101', 'Guild Raid Season 101', 'season', 'guild_raid', 'guild_raid_season', 101, NULL, NULL, FALSE, FALSE, TRUE, FALSE),
  ('/guild-raid/s102', 'Guild Raid Season 102', 'season', 'guild_raid', 'guild_raid_season', 102, NULL, NULL, FALSE, FALSE, TRUE, FALSE),
  ('/guild-raid/s103', 'Guild Raid Season 103', 'season', 'guild_raid', 'guild_raid_season', 103, NULL, NULL, FALSE, FALSE, TRUE, FALSE),
  ('/guild-raid/s104', 'Guild Raid Season 104', 'season', 'guild_raid', 'guild_raid_season', 104, NULL, NULL, FALSE, FALSE, TRUE, FALSE),
  ('/guild-raid/s105', 'Guild Raid Season 105', 'season', 'guild_raid', 'guild_raid_season', 105, NULL, NULL, FALSE, TRUE, FALSE, FALSE),
  ('/replay-library', 'Replay Library', 'interactive_tool', 'guild_raid', 'replay_library', NULL, NULL, NULL, TRUE, FALSE, FALSE, TRUE)
]);
