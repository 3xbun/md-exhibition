// NocoDB client for the Subjects table (MD-Exhibition base).
// Same token committed in the SPA source by standing choice (see Search.vue).
import axios from "axios";

const TOKEN = "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw";
const BASE = "https://ndb.3xbun.com/api";
const BASE_ID = "phwpgzpi0rlfxtm";
const SUBJECTS = "mjopkql27cwy75k";

const hdrs = () => ({ "xc-token": TOKEN, "Content-Type": "application/json" });

/** All subjects (learning-area descriptions), insertion order. */
export async function listSubjects(limit = 100) {
  const res = await axios.get(`${BASE}/v3/data/${BASE_ID}/${SUBJECTS}/records`, {
    params: { limit: String(limit), sort: JSON.stringify([{ field: "Id", direction: "asc" }]) },
    headers: hdrs(),
  });
  return res.data?.records ?? [];
}

/**
 * Create or update a subject row. `item` = { Subject, Description }.
 * Pass `id` (numeric) to update; omit to create.
 */
export async function saveSubject(item, id = null) {
  const fields = {};
  if (item.Subject != null) fields.Subject = String(item.Subject).trim();
  if (item.Description != null) fields.Description = String(item.Description).trim();
  if (id != null) {
    const res = await axios.patch(
      `${BASE}/v3/data/${BASE_ID}/${SUBJECTS}/records`,
      [{ id: Number(id), fields }],
      { headers: hdrs() }
    );
    return res.data?.records?.[0];
  }
  const res = await axios.post(
    `${BASE}/v3/data/${BASE_ID}/${SUBJECTS}/records`,
    { fields },
    { headers: hdrs() }
  );
  return res.data?.records?.[0];
}

/** Delete a subject row. */
export async function deleteSubject(id) {
  const res = await axios.delete(
    `${BASE}/v3/data/${BASE_ID}/${SUBJECTS}/records`,
    { data: [{ id: Number(id) }], headers: hdrs() }
  );
  return res.data;
}
