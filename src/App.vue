<template>
  <div class="app-shell">
    <div class="lang-switch" role="group" aria-label="Language">
      <button
        v-for="l in langs"
        :key="l"
        class="lang-btn"
        :class="{ active: locale === l }"
        @click="setLocale(l)"
      >
        {{ l === "en" ? "EN" : "ไทย" }}
      </button>
    </div>

    <div class="app-main">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, provide, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { setLocale } from "./i18n";
import Footer from "./components/Footer.vue";

const events = ref([]);
provide("events", events);

const { locale } = useI18n();
const langs = ["th", "en"];
const currentLocale = computed(() => locale.value);

const EVENTS_TABLE = import.meta.env.VITE_EVENTS_TABLE || "mqdt1iaupd641lf";
const TOKEN =
  import.meta.env.VITE_NOCODB_TOKEN || "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw";

onMounted(() => {
  axios
    .get(`https://ndb.3xbun.com/api/v2/tables/${EVENTS_TABLE}/records`, {
      params: { offset: "0", limit: "200", where: "", viewId: "vwu7qjq0bmxdes2t" },
      headers: { "xc-token": TOKEN },
    })
    .then((res) => (events.value = res.data.list))
    .catch((err) => console.error(err));
});
</script>

<style scoped>
.lang-switch {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
  display: inline-flex;
  gap: 0.15rem;
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 999px;
  padding: 0.2rem;
  box-shadow: var(--md-shadow);
}
.lang-btn {
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  color: var(--md-text-soft);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.lang-btn.active {
  background: var(--md-accent);
  color: #fff;
}
</style>
