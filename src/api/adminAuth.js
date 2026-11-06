// 6-digit staff PIN gate (shared by /admin and /admin/scan).
//
// Only the SHA-256 (hex) of the PIN ships in the bundle — the PIN itself
// never appears in source. A successful unlock is kept for the browser
// session (per-tab sessionStorage) so staff don't re-enter it per page.
export const PIN_HASH =
  "b7289491b0a241c4955a8aafbb4935693cb1de5ad7b4efa01d2623ed1a138a50";

const UNLOCK_KEY = "md-exhibition.admin-unlocked";

/** True if this browser tab has already passed the PIN gate. */
export function isUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

/** Constant-time compare so the hash isn't revealed byte-by-byte by timing. */
function ctEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const sha256Hex = async (text) => {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

/**
 * Check a 6-digit PIN. Returns true on success (and remembers the unlock
 * for this tab); false on a wrong PIN.
 */
export async function tryUnlockPin(pin) {
  const hash = await sha256Hex(String(pin ?? "").trim());
  if (!ctEqual(hash, PIN_HASH)) return false;
  try {
    sessionStorage.setItem(UNLOCK_KEY, "1");
  } catch {
    /* private mode — gate still works for this navigation */
  }
  return true;
}
