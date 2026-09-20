import assert from "node:assert/strict";
import { resolveNextGuildRaidSeason } from "../src/lib/guildRaidSeason.mjs";

const pages = ["../pages/guild-raid/s109.astro", "../pages/guild-raid/s110.astro"];

const available = resolveNextGuildRaidSeason("109", pages);
assert.equal(available.seasonNumber, "110");
assert.equal(available.href, "/guild-raid/s110");
assert.equal(available.fullGuideHref, "/guild-raid/s110");
assert.equal(available.webImage, "/images/web/guild-raid-s110-mythic.webp");

const preview = resolveNextGuildRaidSeason("110", pages);
assert.equal(preview.seasonNumber, "111");
assert.equal(preview.href, "/guild-raid/next-season");
assert.equal(preview.fullGuideHref, null);
assert.equal(preview.webImage, "/images/web/guild-raid-s110-coming-soon.webp");
assert.equal(preview.image, "/images/guild-raid-s110-coming-soon.png");
assert.equal(preview.thumbnail, preview.webImage);
assert.equal(preview.title, "Next Season");
assert.equal(preview.description, "Prepare for the next season with boss lineups, maps, and more");

const newlyAvailable = resolveNextGuildRaidSeason("110", [...pages, "../pages/guild-raid/s111.astro"]);
assert.equal(newlyAvailable.href, "/guild-raid/s111");
assert.equal(newlyAvailable.fullGuideHref, "/guild-raid/s111");
assert.equal(newlyAvailable.webImage, "/images/web/guild-raid-s111-mythic.webp");

// Do not skip a missing next season just because a later guide exists.
const laterSeason = resolveNextGuildRaidSeason("110", [...pages, "../pages/guild-raid/s112.astro"]);
assert.equal(laterSeason.fullGuideHref, null);
assert.equal(laterSeason.image, preview.image);

// Older routes use zero-padded season numbers.
const padded = resolveNextGuildRaidSeason("97", ["../pages/guild-raid/s098.astro"]);
assert.equal(padded.href, "/guild-raid/s098");
assert.equal(padded.webImage, "/images/web/guild-raid-s98-mythic.webp");

console.log("Next Season checks passed: available guide, upcoming preview, new guide discovery, and exact season matching.");
