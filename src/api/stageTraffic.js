// NocoDB client for the StageTraffic table (MD-Exhibition base).
// Same token committed in the SPA source by standing choice (see Search.vue).
// One row per (stage, device) — the first point collected at a stage.
import axios from "axios";

const TOKEN = "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw";
const BASE = "https://ndb.3xbun.com/api";
const BASE_ID = "phwpgzpi0rlfxtm";
const STAGE_TRAFFIC = "my46dye3nlprz98";

const hdrs = () => ({ "xc-token": TOKEN, "Content-Type": "application/json" });

// Device-level memory of collected stages (per browser storage, no accounts).
const LS_KEY = "md-exhibition.stage-points";

export function getCollectedStages() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addCollectedStage(stage) {
  const all = getCollectedStages();
  if (!all.includes(stage)) {
    all.push(stage);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  }
  return all;
}

/**
 * Record the first point for a stage from this device.
 * Returns { ok, first } — `first` is true only when this device had not
 * collected the stage yet (and the DB row was written).
 */
export async function collectStagePoint(stage) {
  if (getCollectedStages().includes(stage)) {
    return { ok: true, first: false };
  }
  try {
    await axios.post(
      `${BASE}/v3/data/${BASE_ID}/${STAGE_TRAFFIC}/records`,
      { fields: { Stage: stage, ScannedAt: new Date().toISOString() } },
      { headers: hdrs() }
    );
  } catch (e) {
    // DB write failed — still record locally so the visitor sees the point,
    // but surface the failure for the page's error state.
    addCollectedStage(stage);
    return { ok: false, first: false };
  }
  addCollectedStage(stage);
  return { ok: true, first: true };
}

/**
 * All traffic rows, aggregated per stage:
 * [{ stage, points, lastAt }] sorted by points desc, then stage name.
 */
export async function getStageTraffic(limit = 1000) {
  const all = [];
  let offset = 0;
  for (;;) {
    const res = await axios.get(
      `${BASE}/v3/data/${BASE_ID}/${STAGE_TRAFFIC}/records`,
      { params: { limit: String(limit), offset: String(offset) }, headers: hdrs() }
    );
    const recs = res.data?.records ?? [];
    all.push(...recs);
    if (recs.length < limit) break;
    offset += limit;
    if (offset > 10000) break; // hard stop against runaway paging
  }
  const byStage = new Map();
  for (const r of all) {
    const s = r.fields?.Stage;
    if (!s) continue;
    const t = r.fields?.ScannedAt || "";
    const cur = byStage.get(s) || { stage: s, points: 0, lastAt: "" };
    cur.points += 1;
    if (t > cur.lastAt) cur.lastAt = t;
    byStage.set(s, cur);
  }
  return [...byStage.values()].sort(
    (a, b) => b.points - a.points || a.stage.localeCompare(b.stage, "th")
  );
}
