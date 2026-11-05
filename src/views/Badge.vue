<template>
  <div class="container">
    <div class="page-header print-hide">
      <button class="back-btn" @click="router.go(-1)">
        <i class="fa-duotone fa-solid fa-angle-left"></i>
      </button>
      <i class="fa-duotone fa-solid fa-id-badge title-icon"></i>
      <h1>{{ th.badge_title }}</h1>
    </div>

    <div class="badge-wrap" v-if="parent">
      <p class="badge-sub print-hide">{{ th.badge_sub }}</p>
      <BadgeCard :parent="parent" :children="children" />
      <button class="print-btn print-hide" @click="printBadge">
        <i class="fa-duotone fa-solid fa-print"></i>
        <span>{{ th.print_btn }}</span>
      </button>
      <button
        v-if="isMine"
        class="remove-btn print-hide"
        @click="removeMe"
      >
        <i class="fa-duotone fa-solid fa-xmark"></i>
        <span>{{ th.badge_removed }}</span>
      </button>
    </div>
    <p v-else-if="loaded" class="no-result">{{ th.not_found }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import router from "../routers";
import BadgeCard from "../components/BadgeCard.vue";
import { th } from "../copy/th.js";
import { findParentByBadgeCode, getChildren } from "../api/parents.js";
import { hasMyBadge, removeMyBadge } from "../api/myBadge.js";

const route = useRoute();
const parent = ref(null);
const children = ref([]);
const loaded = ref(false);
const isMine = ref(false);

onMounted(async () => {
  const code = String(route.params.code ?? "").trim();
  if (code) {
    isMine.value = hasMyBadge(code);
    const rec = await findParentByBadgeCode(code);
    if (rec?.fields) {
      parent.value = rec.fields;
      children.value = await getChildren(rec.id);
    }
  }
  loaded.value = true;
});

const printBadge = () => window.print();

const removeMe = () => {
  const code = String(route.params.code ?? "").trim();
  if (!code) return;
  removeMyBadge(code);
  router.replace("/");
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
