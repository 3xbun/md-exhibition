// NocoDB client for the Parents table (MD-Exhibition base).
// Same token committed in the SPA source by standing choice (see Search.vue).
import axios from "axios";

const TOKEN = "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw";
const BASE = "https://ndb.3xbun.com/api";
const BASE_ID = "phwpgzpi0rlfxtm";
const MEMBERS = "mwfbjodbvl2b76n"; // student roster
const PARENTS = "m9cul845ocsa29s"; // parent badges
const CHILD_LINK_FIELD = "cd1mizgt37iabao"; // Parents -> Members (many-to-many)

// Plain header object (NOT a config) — used as `headers: hdrs()`
const hdrs = () => ({ "xc-token": TOKEN, "Content-Type": "application/json" });

/** Find a student by StudentID (string). Returns the member record or null. */
export async function findMemberByStudentID(studentID) {
  const sid = String(studentID ?? "").trim();
  if (!sid) return null;
  const res = await axios.get(`${BASE}/v2/tables/${MEMBERS}/records`, {
    params: {
      limit: "5",
      viewId: "vwdwhufmh2erw8a8",
      where: `(StudentID,eq,${sid})`,
    },
    headers: hdrs(),
  });
  return res.data?.list?.[0] ?? null;
}

/** Create a parent/guest record (and link child when type is parent). */
export async function createParent(parent, memberId) {
  const res = await axios.post(
    `${BASE}/v3/data/${BASE_ID}/${PARENTS}/records`,
    {
      fields: {
        FirstName: parent.FirstName,
        LastName: parent.LastName,
        BadgeCode: parent.BadgeCode,
        Type: parent.Type,
      },
    },
    { headers: hdrs() }
  );
  const parentRecord = res.data?.records?.[0];
  if (!parentRecord) throw new Error("Parent create failed");
  if (memberId) {
    await axios.post(
      `${BASE}/v3/data/${BASE_ID}/${PARENTS}/links/${CHILD_LINK_FIELD}/${parentRecord.id}`,
      [memberId],
      { headers: hdrs() }
    );
  }
  return parentRecord;
}

/** Look up a parent badge by BadgeCode. Returns the parent record or null. */
export async function findParentByBadgeCode(badgeCode) {
  const code = String(badgeCode ?? "").trim();
  if (!code) return null;
  const res = await axios.get(`${BASE}/v3/data/${BASE_ID}/${PARENTS}/records`, {
    params: { where: `(BadgeCode,eq,${JSON.stringify(code)})` },
    headers: hdrs(),
  });
  return res.data?.records?.[0] ?? null;
}

/** All children (Members records) linked to a parent record id.
 *  Enriched with full member fields (name, class) since the links
 *  endpoint only returns a partial projection (StudentID). */
export async function getChildren(parentId) {
  const res = await axios.get(
    `${BASE}/v3/data/${BASE_ID}/${PARENTS}/links/${CHILD_LINK_FIELD}/${parentId}`,
    { headers: hdrs() }
  );
  const links = res.data?.records ?? [];
  if (!links.length) return [];
  const where = links
    .map((l) => `(Id,eq,${l.id})`)
    .join("~or");
  const full = await axios.get(
    `${BASE}/v3/data/${BASE_ID}/${MEMBERS}/records`,
    { params: { where, limit: "50" }, headers: hdrs() }
  );
  const byId = Object.fromEntries((full.data?.records ?? []).map((r) => [r.id, r]));
  // preserve link order
  return links.map((l) => byId[l.id] ?? { id: l.id, fields: { StudentID: l.fields?.StudentID } });
}

/** All registered badges (parents + guests). */
export async function listParents(limit = 200) {
  const res = await axios.get(`${BASE}/v3/data/${BASE_ID}/${PARENTS}/records`, {
    params: {
      limit: String(limit),
      sort: JSON.stringify([{ field: "CreatedAt", direction: "desc" }]),
    },
    headers: hdrs(),
  });
  return res.data?.records ?? [];
}

/** True if a member (student) already has a parent badge linked. */
export async function hasParentForMember(memberId) {
  const res = await axios.get(
    `${BASE}/v3/data/${BASE_ID}/${MEMBERS}/records?where=(Id,eq,${memberId})`,
    { headers: hdrs() }
  );
  return Boolean(res.data?.records?.[0]?.fields?.Parent);
}

/**
 * Record a staff check-in: stamp CheckedInAt (ISO UTC) on the parent record.
 * Idempotent — if the badge was already checked in, keeps the original time.
 * Returns { ok, checkedInAt, first } where `first` is true only for the
 * first check-in of this badge.
 */
export async function checkInParent(parentId) {
  const before = await findParentById(parentId);
  if (before?.fields?.CheckedInAt) {
    return { ok: true, checkedInAt: before.fields.CheckedInAt, first: false };
  }
  // Bulk-update form (single-element array) — the path-id PATCH route does
  // not exist on this NocoDB build.
  const res = await axios.patch(
    `${BASE}/v3/data/${BASE_ID}/${PARENTS}/records`,
    [{ id: Number(parentId), fields: { CheckedInAt: new Date().toISOString() } }],
    { headers: hdrs() }
  );
  const updated = res.data?.records?.[0]?.fields?.CheckedInAt;
  if (!updated) throw new Error("Check-in update failed");
  return { ok: true, checkedInAt: updated, first: true };
}

/** Find a parent record by numeric id. Returns the record or null. */
export async function findParentById(parentId) {
  const res = await axios.get(`${BASE}/v3/data/${BASE_ID}/${PARENTS}/records`, {
    params: { where: `(Id,eq,${Number(parentId)})` },
    headers: hdrs(),
  });
  return res.data?.records?.[0] ?? null;
}

/**
 * Unique badge code per type: PA-XXXXXXXX / GU-XXXXXXXX
 * (random 6 alphanumeric, no 0/O/1/I). Checked against existing badges.
 */
export async function makeBadgeCode(type) {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I
  const prefix = type === "guest" ? "GU" : "PA";
  for (;;) {
    let tail = "";
    for (let i = 0; i < 6; i++) tail += alpha[Math.floor(Math.random() * alpha.length)];
    const code = `${prefix}-${tail}`;
    const existing = await findParentByBadgeCode(code);
    if (!existing) return code;
  }
}
