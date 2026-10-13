const dateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function localDate(date) {
  const parts = Object.fromEntries(dateFormatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** Subtract calendar months, clamping the day to the target month's last day. */
export function discussionCutoffDate(referenceDate, maxAgeMonths) {
  const [year, month, day] = localDate(referenceDate).split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 - maxAgeMonths, 1));
  const targetYear = target.getUTCFullYear();
  const targetMonth = target.getUTCMonth();
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
}

/**
 * @param {{ posts: Record<string, { title: string, label: string, url: string, publishedAt: number }>, pages: Record<string, string[]> }} data
 * @param {{ maxAgeMonths: number, rejectedMatches: { page: string, postId: string }[] }} policy
 * @param {string} pathname
 * @param {Date} [referenceDate]
 */
export function selectRelatedDiscussions(data, policy, pathname, referenceDate = new Date()) {
  const segments = pathname.split("/").filter(Boolean);
  const route = segments.length ? `/${segments.join("/")}/` : "/";
  const cutoff = discussionCutoffDate(referenceDate, policy.maxAgeMonths);
  const today = localDate(referenceDate);
  const rejected = new Set(policy.rejectedMatches.filter(({ page }) => page === route).map(({ postId }) => postId));
  return [...new Set(data.pages[route] || [])]
    .filter((id) => !rejected.has(id))
    .map((id) => {
      const post = data.posts[id];
      if (!post) throw new Error(`Related Discussions: missing post ${id} for ${route}`);
      return { id, ...post };
    })
    .filter(({ publishedAt }) => {
      if (!Number.isFinite(publishedAt) || publishedAt <= 0) return false;
      const published = new Date(publishedAt * 1000);
      if (!Number.isFinite(published.getTime())) return false;
      const publishedDate = localDate(published);
      return publishedDate >= cutoff && publishedDate <= today;
    })
    .sort((a, b) => b.publishedAt - a.publishedAt || a.id.localeCompare(b.id))
    .slice(0, 5);
}
