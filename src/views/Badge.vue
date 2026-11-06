<template>
  <div class="container">
    <div class="page-header print-hide">
      <button class="back-btn" @click="router.go(-1)">
        <i class="fa-duotone fa-solid fa-angle-left"></i>
      </button>
      <i class="fa-duotone fa-solid fa-id-badge title-icon"></i>
      <h1>{{ listMode ? th.badge_list : th.badge_title }}</h1>
    </div>

    <div v-if="listMode">
      <p class="badge-sub print-hide">{{ th.badge_list_sub }}</p>
      <div v-if="badges.length" class="badge-list">
        <router-link
          v-for="b in badges"
          :key="b.code"
          :to="`/badge/${encodeURIComponent(b.code)}`"
          class="badge-row"
        >
          <i
            class="fa-duotone fa-solid"
            :class="b.type === 'guest' ? 'fa-user-group' : 'fa-user-shield'"
          ></i>
          <span class="badge-row-name">{{ b.name }}</span>
          <span class="badge-row-code">{{ b.code }}</span>
          <button
            class="badge-row-x"
            @click.stop.prevent="removeMe(b.code)"
            :title="th.badge_removed"
          >
            <i class="fa-duotone fa-solid fa-xmark"></i>
          </button>
        </router-link>
      </div>
      <p v-else class="no-result">{{ th.badge_list_empty }}</p>
    </div>

    <div class="badge-wrap" v-else-if="parent">
      <p class="badge-sub print-hide">{{ th.badge_sub }}</p>
      <BadgeCard :parent="parent" :children="children" />
      <div class="badge-actions print-hide">
        <button class="print-btn" @click="printBadge">
          <i class="fa-duotone fa-solid fa-print"></i>
          <span>{{ th.print_btn }}</span>
        </button>
        <button class="print-btn" @click="shareOpen = !shareOpen">
          <i class="fa-duotone fa-solid fa-share-nodes"></i>
          <span>{{ th.share_btn }}</span>
        </button>
      </div>
      <button
        v-if="!isMine"
        class="save-btn print-hide"
        @click="saveHere"
      >
        <i class="fa-duotone fa-solid fa-download"></i>
        <span>{{ th.save_here }}</span>
      </button>
      <button
        v-else
        class="remove-btn print-hide"
        @click="removeMe"
      >
        <i class="fa-duotone fa-solid fa-xmark"></i>
        <span>{{ th.badge_removed }}</span>
      </button>

      <!-- Share panel: QR of the badge URL for the recipient's phone -->
      <div class="share-card print-hide" v-if="shareOpen">
        <p class="share-sub">{{ th.share_sub }}</p>
        <QrCanvas :text="badgeUrl" size="220" />
        <div class="share-url">{{ badgeUrl }}</div>
        <button v-if="isMine" class="sent-btn" @click="confirmSent">
          <i class="fa-duotone fa-solid fa-check"></i>
          <span>{{ th.confirm_sent }}</span>
        </button>
        <p v-if="sentDone" class="sent-done">{{ th.sent_done }}</p>
      </div>
    </div>
    <p v-else-if="loaded" class="no-result">{{ th.not_found }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import router from "../routers";
import BadgeCard from "../components/BadgeCard.vue";
import QrCanvas from "../components/QrCanvas.vue";
import { th } from "../copy/th.js";
import { findParentByBadgeCode, getChildren } from "../api/parents.js";
import {
  getMyBadges,
  hasMyBadge,
  removeMyBadge,
  saveMyBadge,
} from "../api/myBadge.js";

const route = useRoute();
const parent = ref(null);
const children = ref([]);
const loaded = ref(false);
const isMine = ref(false);
const shareOpen = ref(false);
const sentDone = ref(false);

// /badge (no code) lists every badge saved on THIS device (localStorage).
const listMode = computed(() => !String(route.params.code ?? "").trim());
const badges = ref(getMyBadges());
const refreshBadges = () => (badges.value = getMyBadges());
window.addEventListener("md-badge-change", refreshBadges);
window.addEventListener("storage", refreshBadges);
onUnmounted(() => {
  window.removeEventListener("md-badge-change", refreshBadges);
  window.removeEventListener("storage", refreshBadges);
});

const QR_BASE = "https://md-exhibition.pages.dev";
const badgeUrl = computed(() => `${QR_BASE}/badge/${parent.value?.BadgeCode ?? ""}`);

// Load the badge for the current :code. Watched (not onMounted) because
// /badge and /badge/:code share this component — a client-side nav from the
// list reuses the component, so onMounted would not re-fire and the stale
// "not found" state would remain until a hard refresh.
watch(
  () => String(route.params.code ?? "").trim(),
  async (code) => {
    parent.value = null;
    children.value = [];
    loaded.value = false;
    shareOpen.value = false;
    sentDone.value = false;
    if (code) {
      isMine.value = hasMyBadge(code);
      const rec = await findParentByBadgeCode(code);
      if (rec?.fields) {
        parent.value = rec.fields;
        children.value = await getChildren(rec.id);
      }
    }
    loaded.value = true;
  },
  { immediate: true }
);

const printBadge = () => window.print();

const saveHere = () => {
  if (!parent.value) return;
  saveMyBadge({
    code: parent.value.BadgeCode,
    name: `${parent.value.FirstName} ${parent.value.LastName}`,
    type: parent.value.Type,
  });
  isMine.value = true;
};

const removeMe = (code) => {
  const c = code ?? String(route.params.code ?? "").trim();
  if (!c) return;
  removeMyBadge(c);
  if (!listMode.value) router.replace("/");
};

const confirmSent = () => {
  const code = String(route.params.code ?? "").trim();
  if (!code) return;
  removeMyBadge(code);
  sentDone.value = true;
  isMine.value = false;
};
</script>

<style scoped>
.badge-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.badge-sub {
  color: var(--md-text-soft);
  text-align: center;
  max-width: 420px;
}
.print-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 1.6rem;
  border: 1px solid var(--md-border);
  border-radius: 999px;
  background: var(--md-surface);
  color: var(--md-text);
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--md-shadow);
}
.no-result {
  text-align: center;
  color: var(--md-text-muted);
  padding: 2rem 0;
}
.badge-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}
.badge-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--md-border);
  border-radius: 0.9rem;
  background: var(--md-surface);
  color: var(--md-text);
  text-decoration: none;
  box-shadow: var(--md-shadow);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.badge-row:hover {
  transform: translateY(-1px);
  box-shadow: var(--md-shadow-lg);
}
.badge-row-name {
  font-weight: 600;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.badge-row-code {
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--md-text-muted);
}
.badge-row-x {
  border: none;
  background: none;
  color: #c0392b;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}
.badge-row-x:hover {
  background: #f7e8e5;
}
.badge-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}
.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 999px;
  background: #2f9e63;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--md-shadow);
}
.share-card {
  width: 100%;
  max-width: 380px;
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  box-shadow: var(--md-shadow);
  padding: 1.25rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.share-sub {
  color: var(--md-text-soft);
  font-size: 0.9rem;
  margin: 0;
}
.share-card canvas {
  background: #fff;
  border: 1px solid var(--md-border);
  border-radius: 0.6rem;
  padding: 0.4rem;
}
.share-url {
  font-size: 0.7rem;
  color: var(--md-text-muted);
  word-break: break-all;
  letter-spacing: 0.02em;
}
.sent-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.3rem;
  border: none;
  border-radius: 999px;
  background: var(--md-accent);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.sent-done {
  color: #2f9e63;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}
.remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.2rem;
  border: 1px solid #f1d4cf;
  border-radius: 999px;
  background: var(--md-surface);
  color: #c0392b;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}

@media print {
  .print-hide {
    display: none !important;
  }
  .container {
    padding: 0;
    max-width: none;
  }
  body {
    background: #fff;
  }
}
</style>
