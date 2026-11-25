// NocoDB client for the Testimonials table (MD-Exhibition base).
// Same token committed in the SPA source by standing choice (see Search.vue).
import axios from "axios";

const TOKEN = "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw";
const BASE = "https://ndb.3xbun.com/api";
const BASE_ID = "phwpgzpi0rlfxtm";
const TESTIMONIALS = "mjopkql27cwy75k";

const hdrs = () => ({ "xc-token": TOKEN, "Content-Type": "application/json" });

/** All testimonials, newest (by Year) first, then creation order. */
export async function listTestimonials(limit = 200) {
  const res = await axios.get(`${BASE}/v3/data/${BASE_ID}/${TESTIMONIALS}/records`, {
    params: {
      limit: String(limit),
      sort: JSON.stringify([
        { field: "Year", direction: "desc" },
        { field: "Id", direction: "desc" },
      ]),
    },
    headers: hdrs(),
  });
  return res.data?.records ?? [];
}

/**
 * Create or update a testimonial. `item` = { Quote, Name, Affiliation, Year }.
 * Pass `id` (numeric) to update the existing row; omit to create.
 * Returns the saved record ({ id, fields }).
 */
export async function saveTestimonial(item, id = null) {
  const fields = {};
  if (item.Quote != null) fields.Quote = String(item.Quote).trim();
  if (item.Name != null) fields.Name = String(item.Name).trim();
  if (item.Affiliation != null) fields.Affiliation = String(item.Affiliation).trim();
  if (item.Year != null && String(item.Year).trim() !== "") {
    const y = Number(item.Year);
    fields.Year = Number.isFinite(y) ? y : null;
  }
  if (id != null) {
    const res = await axios.patch(
      `${BASE}/v3/data/${BASE_ID}/${TESTIMONIALS}/records`,
      [{ id: Number(id), fields }],
      { headers: hdrs() }
    );
    return res.data?.records?.[0];
  }
  const res = await axios.post(
    `${BASE}/v3/data/${BASE_ID}/${TESTIMONIALS}/records`,
    { fields },
    { headers: hdrs() }
  );
  return res.data?.records?.[0];
}

/** Delete a testimonial row. The v3 DELETE body is [{id: N}]. */
export async function deleteTestimonial(id) {
  const res = await axios.delete(
    `${BASE}/v3/data/${BASE_ID}/${TESTIMONIALS}/records`,
    { data: [{ id: Number(id) }], headers: hdrs() }
  );
  return res.data;
}
