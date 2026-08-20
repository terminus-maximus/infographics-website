export const REFERRAL_PAGEVIEW_KEY = "tm-referral-pageviews";
export const REFERRAL_ENTRANCE_KEY = "tm-referral-entrance-shown";
export const REFERRAL_DISMISSED_KEY = "tm_referral_widget_dismissed";

export function normalizeReferralPath(pathname: string): string {
  if (pathname === "/") return pathname;

  return pathname.replace(/\/+$/, "");
}

export function isHighIntentReferralPath(pathname: string): boolean {
  const path = normalizeReferralPath(pathname);

  return (
    path === "/beginner-guide" ||
    path === "/elite-campaigns" ||
    /^\/campaigns\/[^/]+$/.test(path)
  );
}

export function recordReferralPageview(storage: Storage): number {
  const storedCount = Number.parseInt(storage.getItem(REFERRAL_PAGEVIEW_KEY) || "0", 10);
  const currentCount = Number.isFinite(storedCount) ? storedCount + 1 : 1;

  storage.setItem(REFERRAL_PAGEVIEW_KEY, String(currentCount));

  return currentCount;
}
