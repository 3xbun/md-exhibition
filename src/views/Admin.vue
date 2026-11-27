<template>
  <div class="container">
    <!-- Shared 6-digit PIN gate (also guards /admin/scan). The slot content
         is the only thing rendered after the gate passes; the badge list is
         fetched only once it's unlocked. -->
    <AdminPinGate @unlocked="load">
      <div class="page-header">
        <button class="back-btn" @click="router.go(-1)">
          <i class="fa-duotone fa-solid fa-angle-left"></i>
        </button>
        <i class="fa-duotone fa-solid fa-users-gear title-icon"></i>
        <h1>
          {{ th.admin_title }} <span class="count">{{ totalLabel }}</span>
        </h1>
        <button
          class="refresh-btn"
          @click="refresh"
          :disabled="loading"
          title="refresh"
        >
          <i class="fa-duotone fa-solid fa-rotate" :class="{ spinning: loading }"></i>
        </button>
      </div>

      <p class="admin-sub">{{ th.admin_sub }}</p>
      <div class="scan-links">
        <router-link to="/admin/scan" class="scan-link">
          <i class="fa-duotone fa-solid fa-qrcode"></i>
          <span>{{ th.scan_link }}</span>
        </router-link>
        <router-link to="/admin/traffic" class="scan-link">
          <i class="fa-duotone fa-solid fa-chart-column"></i>
          <span>{{ th.traffic_title }}</span>
        </router-link>
        <router-link to="/admin/subjects" class="scan-link">
          <i class="fa-duotone fa-solid fa-book-open"></i>
          <span>{{ th.sub_admin_title }}</span>
        </router-link>
      </div>

      <div class="admin-search">
        <i class="fa-duotone fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          class="search-input"
          :placeholder="th.admin_search_ph"
          v-model="query"
        />
        <button
          v-if="query"
          class="search-clear"
          @click="query = ''"
          :aria-label="'clear'"
        >
          <i class="fa-duotone fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="admin-table" v-if="skeleton">
        <div class="thead">
          <span>{{ th.col_name }}</span>
          <span>{{ th.col_type }}</span>
          <span>{{ th.col_code }}</span>
          <span>{{ th.col_child }}</span>
          <span>{{ th.col_checkin }}</span>
          <span>{{ th.col_created }}</span>
        </div>
        <div v-for="n in skeletonRows" :key="n" class="trow skel-row">
          <span class="skeleton skel-name"></span>
          <span class="skeleton skel-chip"></span>
          <span class="skeleton skel-code"></span>
          <span class="skeleton skel-chip"></span>
          <span class="skeleton skel-chip"></span>
          <span class="skeleton skel-date"></span>
        </div>
      </div>

      <div class="admin-table" v-else-if="rows.length">
        <div class="thead">
          <span>{{ th.col_name }}</span>
          <span>{{ th.col_type }}</span>
          <span>{{ th.col_code }}</span>
          <span>{{ th.col_child }}</span>
          <span>{{ th.col_checkin }}</span>
          <span>{{ th.col_created }}</span>
        </div>
        <router-link
          v-for="row in rows"
          :key="row.id"
          :to="`/badge/${encodeURIComponent(row.fields.BadgeCode)}`"
          class="trow"
        >
          <span class="c-name">{{ row.fields.FirstName }} {{ row.fields.LastName }}</span>
          <span>
            <span class="type-chip" :class="typeChipClass(row.fields.Type)">
              {{ typeLabel(row.fields.Type) }}
            </span>
          </span>
          <span class="c-code">{{ row.fields.BadgeCode }}</span>
          <span class="c-children">
            <span v-for="sid in row.childIds" :key="sid" class="chip">{{ sid }}</span>
            <span v-if="row.fields.ClassNumber" class="chip">
              <i class="fa-duotone fa-solid fa-building"></i> {{ row.fields.ClassNumber }}
            </span>
            <span v-if="!row.childIds.length && row.fields.Phone" class="chip">
              <i class="fa-duotone fa-solid fa-phone"></i> {{ row.fields.Phone }}
            </span>
          </span>
          <span class="c-checkin" :class="{ done: row.fields.CheckedInAt }">
            <template v-if="row.fields.CheckedInAt">
              <i class="fa-duotone fa-solid fa-circle-check"></i>
              {{ formatDate(row.fields.CheckedInAt) }}
            </template>
            <template v-else>{{ th.not_checked }}</template>
          </span>
          <span class="c-date">{{ formatDate(row.fields.CreatedAt) }}</span>
        </router-link>
      </div>

      <p v-else-if="loaded && !query && !loading" class="no-result">{{ th.empty }}</p>
      <p v-else-if="loaded && query && !loading" class="no-result">{{ th.admin_no_match }}</p>

      <div class="admin-pager" v-if="!skeleton && total > PAGE_SIZE">
        <button
          class="pager-btn"
          :disabled="page <= 1 || loading"
          @click="page--"
          :aria-label="th.admin_prev_page"
        >
          <i class="fa-duotone fa-solid fa-angle-left"></i>
        </button>
        <span class="pager-info">{{ page }} / {{ totalPages }}</span>
        <button
          class="pager-btn"
          :disabled="page >= totalPages || loading"
          @click="page++"
          :aria-label="th.admin_next_page"
        >
          <i class="fa-duotone fa-solid fa-angle-right"></i>
        </button>
      </div>
    </AdminPinGate>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import router from "../routers";
import dayjs from "dayjs";
import { th } from "../copy/th.js";
import AdminPinGate from "../components/AdminPinGate.vue";
import { isUnlocked } from "../api/adminAuth.js";
import { listParents, getChildren } from "../api/parents.js";

const PAGE_SIZE = 25;
const CACHE_KEY = "md-exhibition.admin-badges";

// `all` holds every badge record (newest-first). It is hydrated from
// localStorage first (instant, no skeleton flash), then re-fetched in the
// background and the cache is refreshed. Search + pagination run on this
// cached set client-side, so flipping pages / searching is instant.
const all = ref([]);
const allChildren = ref({}); // parentId -> [StudentID, ...]
const loaded = ref(false);
const loading = ref(false);
const query = ref("");
const page = ref(1);

// Client-side search: first name, last name OR badge code.
const filteredList = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return all.value;
  return all.value.filter((r) => {
    const f = r.fields;
    const name = `${f.FirstName ?? ""} ${f.LastName ?? ""}`.toLowerCase();
    return name.includes(q) || String(f.BadgeCode ?? "").toLowerCase().includes(q);
  });
});

const total = computed(() => filteredList.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / PAGE_SIZE))
);
const totalLabel = computed(() => `${total.value} ${th.total_label}`);

// Current page slice, joined with the (per-page) child ids.
const rows = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE;
  return filteredList.value
    .slice(start, start + PAGE_SIZE)
    .map((r) => ({ id: r.id, fields: r.fields, childIds: allChildren.value[r.id] ?? [] }));
});

// Skeleton: only while a full fetch is in flight AND nothing is on screen yet
// (a cached list renders instantly, so a background refresh never re-skeletons).
const skeleton = computed(() => loading.value && all.value.length === 0);
const skeletonRows = PAGE_SIZE;

// Keep the page valid if the list shrinks (e.g. a search narrows results).
watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp;
});
watch(query, () => {
  page.value = 1;
  fetchChildrenForPage();
});
// Children are fetched per page (the links API is per-parent — not for all
// 1,600+ at once). Flip page / search -> refresh children for the slice.
watch(page, fetchChildrenForPage);

// --- localStorage cache ---------------------------------------------
function readCache() {
  try {
    const obj = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
    return obj && Array.isArray(obj.records) ? obj : null;
  } catch {
    return null;
  }
}
function writeCache(records) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), records }));
  } catch {
    /* storage full / private mode — cache is best-effort */
  }
}

// --- children (per page) --------------------------------------------
async function loadChildren(ids) {
  const out = {};
  let i = 0;
  const worker = async () => {
    while (i < ids.length) {
      const id = ids[i++];
      try {
        out[id] = (await getChildren(id)).map((r) => r.fields?.StudentID).filter(Boolean);
      } catch {
        out[id] = [];
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, ids.length) }, worker));
  return out;
}
async function fetchChildrenForPage() {
  const start = (page.value - 1) * PAGE_SIZE;
  const slice = filteredList.value.slice(start, start + PAGE_SIZE);
  const missing = slice.map((r) => r.id).filter((id) => !(id in allChildren.value));
  if (!missing.length) return;
  try {
    const kids = await loadChildren(missing);
    Object.assign(allChildren.value, kids);
  } catch {
    /* child chips stay empty; badge rows still render */
  }
}

// --- load -----------------------------------------------------------
// Hydrates from cache first (instant), then fetches the full list, persists it,
// and refreshes children for the current page. A seq guard drops stale
// responses if a refresh races an earlier one.
let seq = 0;
async function load() {
  if (!isUnlocked()) return;
  const mySeq = ++seq;
  const cache = readCache();
  if (cache && cache.records.length) {
    all.value = cache.records;
    loaded.value = true;
  }
  loading.value = true;
  try {
    const recs = await listParents({ fetchAll: true });
    if (mySeq !== seq) return;
    all.value = recs;
    writeCache(recs);
  } catch (e) {
    console.error("admin load failed", e);
    if (!cache || !cache.records.length) all.value = []; // show empty, not stuck
  } finally {
    if (mySeq === seq) {
      loaded.value = true;
      loading.value = false;
      fetchChildrenForPage();
    }
  }
}
// Manual refresh: re-fetch the full list while keeping the current rows on
// screen (no skeleton, since `all` is already populated).
function refresh() {
  load();
}

onMounted(() => {
  if (isUnlocked()) load();
});

const formatDate = (iso) =>
  iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "";

// Type chip: label text + CSS class (parent blue / outside + alumni gold).
const typeLabel = (t) =>
  t === "alumni"
    ? th.alumni_label
    : t === "outside" || t === "guest"
      ? th.outside_label
      : th.parent_label;
const typeChipClass = (t) => (t === "parent" ? "" : "guest");
</script>

<style scoped>
.admin-sub {
  color: var(--md-text-soft);
  margin-bottom: 0.75rem;
}
.count {
  color: var(--md-text-muted);
  font-size: 1rem;
  font-weight: 400;
}
.refresh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  border: 1px solid var(--md-border);
  background: var(--md-surface);
  color: var(--md-accent);
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--md-shadow);
  transition: background 0.12s ease;
  flex: none;
}
.refresh-btn:hover:not(:disabled) {
  background: var(--md-accent-soft);
}
.refresh-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.spinning {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.scan-links {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.scan-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.3rem;
  border-radius: 999px;
  background: var(--md-accent);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: var(--md-shadow);
}
.admin-search {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 999px;
  box-shadow: var(--md-shadow);
  max-width: 560px;
  margin: 0 0 1rem;
}
.search-icon {
  padding: 0 0 0 1.1rem;
  color: var(--md-text-muted);
  font-size: 0.9rem;
}
.search-input {
  flex: 1;
  padding: 0.8rem 1rem 0.8rem 1.6rem;
  background: transparent;
  border: none;
  outline: none;
  color: var(--md-text);
  font-size: 1rem;
  font-family: inherit;
  min-width: 0;
}
.search-input::placeholder {
  color: var(--md-text-muted);
}
.search-clear {
  border: none;
  background: none;
  color: var(--md-text-muted);
  cursor: pointer;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.9rem;
}
.search-clear:hover {
  background: var(--md-surface-2);
  color: var(--md-text);
}
.admin-table {
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  overflow: hidden;
  background: var(--md-surface);
  box-shadow: var(--md-shadow);
}
.thead,
.trow {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr 1fr 1.2fr 1.2fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.8rem 1rem;
}
.thead {
  background: var(--md-surface-2);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--md-text-soft);
}
.trow {
  border-top: 1px solid var(--md-border);
  transition: background 0.12s ease;
}
.trow:hover {
  background: var(--md-accent-soft);
}
.c-name {
  font-weight: 600;
}
.c-code {
  letter-spacing: 0.08em;
  color: var(--md-accent);
  font-weight: 600;
  font-size: 0.9rem;
}
.c-checkin {
  color: var(--md-text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.c-checkin.done {
  color: #2f9e63;
  font-weight: 600;
}
.c-date {
  color: var(--md-text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
}
.c-children {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}
.type-chip,
.chip {
  display: inline-block;
  border-radius: 999px;
  padding: 0.15rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 600;
}
.type-chip {
  background: var(--md-accent-soft);
  color: var(--md-accent);
}
.type-chip.guest {
  background: #f7efdc;
  color: var(--md-gold);
}
.chip {
  background: var(--md-surface-2);
  color: var(--md-text-soft);
}
.no-result {
  text-align: center;
  color: var(--md-text-muted);
  padding: 2rem 0;
}
.admin-loading {
  text-align: center;
  color: var(--md-text-muted);
  padding: 1.5rem 0;
}
.skeleton {
  display: block;
  height: 0.85rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--md-surface-2) 25%,
    #e7ebf3 37%,
    var(--md-surface-2) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.3s ease-in-out infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
.skel-name {
  width: 70%;
}
.skel-chip {
  width: 55%;
}
.skel-code {
  width: 80%;
}
.skel-date {
  width: 75%;
}
.admin-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}
.pager-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 999px;
  border: 1px solid var(--md-border);
  background: var(--md-surface);
  color: var(--md-accent);
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--md-shadow);
  transition: background 0.12s ease;
}
.pager-btn:hover:not(:disabled) {
  background: var(--md-accent-soft);
}
.pager-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.pager-info {
  color: var(--md-text-soft);
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 600px) {
  .thead {
    display: none;
  }
  .trow {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "name type"
      "code code"
      "children children"
      "checkin checkin"
      "date date";
    gap: 0.3rem;
    padding: 0.9rem 1rem;
  }
  .c-name {
    grid-area: name;
  }
  .trow > span:nth-child(2) {
    grid-area: type;
  }
  .c-code {
    grid-area: code;
  }
  .c-children {
    grid-area: children;
  }
  .c-checkin {
    grid-area: checkin;
  }
  .c-date {
    grid-area: date;
  }
}
</style>
