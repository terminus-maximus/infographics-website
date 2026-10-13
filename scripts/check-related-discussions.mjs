import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { discussionCutoffDate, selectRelatedDiscussions } from "../src/lib/relatedDiscussions.mjs";

const policy = JSON.parse(await readFile(new URL("../src/data/relatedDiscussionPolicy.json", import.meta.url)));
const data = JSON.parse(await readFile(new URL("../src/data/relatedDiscussions.json", import.meta.url)));
const asOf = new Date("2026-10-13T12:00:00Z");
assert.equal(policy.maxAgeMonths, 18);
assert.equal(discussionCutoffDate(asOf, 18), "2025-04-13");
assert.equal(discussionCutoffDate(new Date("2026-08-31T12:00:00Z"), 18), "2025-02-28");
assert.equal(discussionCutoffDate(new Date("2025-08-31T12:00:00Z"), 18), "2024-02-29");
// October 13 UTC is still October 12 in Los Angeles at this time.
assert.equal(discussionCutoffDate(new Date("2026-10-13T06:59:59Z"), 18), "2025-04-12");

const fixturePost = (publishedAt) => ({ title: "Discussion", label: "Discussion", url: "https://www.reddit.com/", publishedAt });
const timestamp = (iso) => Date.parse(iso) / 1000;
const fixture = {
  posts: {
    expired: fixturePost(timestamp("2025-04-13T06:59:59Z")),
    boundary: fixturePost(timestamp("2025-04-13T07:00:00Z")),
    newest: fixturePost(timestamp("2026-10-12T12:00:00Z")),
    rejected: fixturePost(timestamp("2026-10-11T12:00:00Z")),
    future: fixturePost(timestamp("2026-10-15T12:00:00Z")),
    invalid: fixturePost(NaN),
    overflow: fixturePost(Number.MAX_VALUE),
    second: fixturePost(timestamp("2026-10-10T12:00:00Z")),
    third: fixturePost(timestamp("2026-10-09T12:00:00Z")),
    fourth: fixturePost(timestamp("2026-10-08T12:00:00Z")),
    fifth: fixturePost(timestamp("2026-10-07T12:00:00Z")),
  },
  pages: {
    "/boundary/": ["expired", "boundary", "future", "invalid", "overflow"],
    "/limited/": ["expired", "boundary", "newest", "rejected", "newest", "fifth", "second", "fourth", "third"],
    "/other/": ["rejected"],
  },
};
const fixturePolicy = { maxAgeMonths: 18, rejectedMatches: [{ page: "/limited/", postId: "rejected" }] };
const ids = (route, date = asOf) => selectRelatedDiscussions(fixture, fixturePolicy, route, date).map(({ id }) => id);
assert.deepEqual(ids("/boundary"), ["boundary"]);
assert.deepEqual(ids("/boundary/", new Date("2026-10-14T12:00:00Z")), []);
assert.deepEqual(ids("/limited/"), ["newest", "second", "third", "fourth", "fifth"]);
assert.deepEqual(ids("/other/"), ["rejected"]);
assert.deepEqual(ids("/"), []);

// Keep live assignments consistent with all recorded rejection decisions.
for (const { page, postId } of policy.rejectedMatches) {
  assert.equal((data.pages[page] || []).includes(postId), false, `${page}: rejected ${postId} must not be assigned`);
}

console.log("Related Discussions checks passed: 18-month boundary, timezone, month-end/leap-year clamping, expired/future/invalid dates, page-specific rejections, deduplication, and newest-five selection.");
