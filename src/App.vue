<template>
  <div class="app-shell">
    <router-link
      v-if="$route.path !== '/register'"
      to="/register"
      class="signup-btn print-hide"
    >
      <i class="fa-duotone fa-solid fa-id-badge"></i>
      <span>{{ th.register_btn }}</span>
    </router-link>
    <div class="app-main">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script setup>
import axios from "axios";
import { onMounted, provide, ref } from "vue";
import Footer from "./components/Footer.vue";
import { th } from "./copy/th.js";

const events = ref([]);
provide("events", events);

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
.signup-btn {
  position: fixed;
  top: 0.9rem;
  right: 0.9rem;
  z-index: 50;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1.05rem;
  border-radius: 999px;
  background: var(--md-surface);
  color: var(--md-accent);
  border: 1px solid var(--md-border);
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: var(--md-shadow);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.signup-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--md-shadow-lg);
}

@media print {
  .print-hide {
    display: none !important;
  }
}
</style>
