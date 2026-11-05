// localStorage-backed "my badge" (no accounts/passwords).
// A visitor keeps up to a few badges on their own phone; the most recent
// one powers the top-right "My Badge" shortcut.
const KEY = "md-exhibition.badges";
const MAX = 3;

/** Read all locally stored badges (newest last). */
export function getMyBadges() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Most recently saved badge, or null. */
export function getLatestBadge() {
  const list = getMyBadges();
  return list.length ? list[list.length - 1] : null;
}

/** Save a badge (by code); dedupes and trims to MAX newest. */
export function saveMyBadge(badge) {
  if (!badge?.code) return;
  const list = getMyBadges().filter((b) => b.code !== badge.code);
  list.push({ ...badge, at: Date.now() });
  while (list.length > MAX) list.shift();
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* private mode etc. — non-fatal */
  }
  try { window.dispatchEvent(new Event("md-badge-change")); } catch {}
}

/** Remove a badge by code. */
export function removeMyBadge(code) {
  try {
    localStorage.setItem(KEY, JSON.stringify(getMyBadges().filter((b) => b.code !== code)));
  } catch {
    /* ignore */
  }
  try { window.dispatchEvent(new Event("md-badge-change")); } catch {}
}

/** True if a badge code is stored on this device. */
export function hasMyBadge(code) {
  return getMyBadges().some((b) => b.code === code);
}
