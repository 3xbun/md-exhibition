<template>
  <div class="container">
    <!-- PIN gate: the only thing between the public URL and the badge list.
         Only the SHA-256 hash of the PIN lives in the bundle (never the
         PIN itself); a successful unlock is kept for the browser session. -->
    <div v-if="!unlocked" class="lock">
      <i class="fa-duotone fa-solid fa-lock lock-icon"></i>
      <h1 class="lock-title">{{ th.lock_title }}</h1>
      <p class="lock-sub">{{ th.lock_sub }}</p>
      <form class="lock-form" @submit.prevent="tryUnlock">
        <input
          v-model="pin"
          type="password"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          class="lock-input"
          :placeholder="th.pin_ph"
          :disabled="busy"
          autofocus
        />
        <button class="btn" type="submit" :disabled="busy || pin.length < 6">
          <i class="fa-duotone fa-solid fa-unlock-keyhole"></i>
          <span>{{ th.unlock_btn }}</span>
        </button>
      </form>
      <p v-if="wrong" class="lock-error">{{ th.pin_wrong }}</p>
    </div>

    <template v-else>
      <div class="page-header">
        <button class="back-btn" @click="router.go(-1)">
          <i class="fa-duotone fa-solid fa-angle-left"></i>
        </button>
        <i class="fa-duotone fa-solid fa-users-gear title-icon"></i>
        <h1>{{ th.admin_title }} <span class="count">{{ filtered.length }} {{ th.total_label }}</span></h1>
      </div>

      <p class="admin-sub">{{ th.admin_sub }}</p>
      <router-link to="/staff" class="scan-link">
        <i class="fa-duotone fa-solid fa-qrcode"></i>
        <span>{{ th.scan_link }}</span>
      </router-link>

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

      <div class="admin-table" v-if="filtered.length">
        <div class="thead">
          <span>{{ th.col_name }}</span>
          <span>{{ th.col_type }}</span>
          <span>{{ th.col_code }}</span>
          <span>{{ th.col_child }}</span>
          <span>{{ th.col_checkin }}</span>
          <span>{{ th.col_created }}</span>
        </div>
        <router-link
          v-for="row in filtered"
          :key="row.id"
          :to="`/badge/${encodeURIComponent(row.fields.BadgeCode)}`"
          class="trow"
        >
          <span class="c-name">{{ row.fields.FirstName }} {{ row.fields.LastName }}</span>
          <span>
            <span class="type-chip" :class="row.fields.Type">
              {{ row.fields.Type === "guest" ? th.guest_label : th.parent_label }}
            </span>
          </span>
          <span class="c-code">{{ row.fields.BadgeCode }}</span>
          <span class="c-children">
            <span v-for="sid in row.childIds" :key="sid" class="chip">{{ sid }}</span>
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

      <p v-else-if="loaded && !query" class="no-result">{{ th.empty }}</p>
      <p v-else-if="loaded && query" class="no-result">{{ th.admin_no_match }}</p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../routers";
import dayjs from "dayjs";
import { th } from "../copy/th.js";
import { listParents, getChildren } from "../api/parents.js";

// ---- PIN gate ----------------------------------------------------------
// 6-digit staff PIN. Only its SHA-256 (hex) is shipped in the bundle —
// the PIN itself is never in the source. Comparison is constant-time so
// the hash is not revealed byte-by-byte by response timing.
const PIN_HASH = "b7289491b0a241c4955a8aafbb4935693cb1de5ad7b4efa01d2623ed1a138a50";
const UNLOCK_KEY = "md-exhibition.admin-unlocked"; // sessionStorage (per-tab)

const pin = ref("");
const wrong = ref(false);
const busy = ref(false);
const unlocked = ref(sessionStorage.getItem(UNLOCK_KEY) === "1");

const sha256Hex = async (text) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const ctEqual = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

const tryUnlock = async () => {
  if (busy.value) return;
  busy.value = true;
  try {
    const hash = await sha256Hex(pin.value.trim());
    if (ctEqual(hash, PIN_HASH)) {
      sessionStorage.setItem(UNLOCK_KEY, "1");
      unlocked.value = true;
      await load();
    } else {
      wrong.value = true;
      pin.value = "";
    }
  } finally {
    busy.value = false;
  }
};
// ------------------------------------------------------------------------

const rows = ref([]);
const loaded = ref(false);
const query = ref("");

// Client-side name filter (list is already loaded in memory).
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return rows.value;
  return rows.value.filter((r) => {
    const name = `${r.fields.FirstName ?? ""} ${r.fields.LastName ?? ""}`.toLowerCase();
    return name.includes(q);
  });
});

// Fetch children per badge with limited concurrency (API rate-limits bursts)
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

// Data loads ONLY after a successful PIN unlock (the list is the protected
// part; the gate itself needs no network).
async function load() {
  if (loaded.value) return;
  loaded.value = true; // set first: the v-if on the table handles the empty state
  const recs = await listParents();
  const kids = await loadChildren(recs.map((r) => r.id));
  rows.value = recs.map((r) => ({
    id: r.id,
    fields: r.fields,
    childIds: kids[r.id] ?? [],
  }));
}

onMounted(() => {
  if (unlocked.value) load();
});

const formatDate = (iso) =>
  iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "";
</script>

<style scoped>
/* PIN gate (the only view before a correct 6-digit PIN) */
.lock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 3.5rem 1rem;
  max-width: 420px;
  margin: 0 auto;
  text-align: center;
}
.lock-icon {
  font-size: 2.6rem;
  color: var(--md-accent);
}
.lock-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}
.lock-sub {
  color: var(--md-text-soft);
  margin: 0;
}
.lock-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}
.lock-input {
  padding: 0.85rem 1rem;
  border: 1px solid var(--md-border);
  border-radius: 999px;
  background: var(--md-surface);
  box-shadow: var(--md-shadow);
  font-size: 1.15rem;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-align: center;
  color: var(--md-text);
  outline: none;
  min-height: 52px;
}
.lock-input:focus {
  border-color: var(--md-accent);
}
.lock-form .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 999px;
  background: var(--md-accent);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--md-shadow);
}
.lock-form .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.lock-error {
  color: #c0392b;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}
.admin-sub {
  color: var(--md-text-soft);
  margin-bottom: 0.75rem;
}
.count {
  color: var(--md-text-muted);
  font-size: 1rem;
  font-weight: 400;
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
  margin-bottom: 1.25rem;
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
