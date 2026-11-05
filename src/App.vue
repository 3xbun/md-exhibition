<template>
  <div class="app-shell">
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
