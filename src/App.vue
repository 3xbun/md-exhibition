<template>
  <router-view />
  <Footer />
</template>

<script setup>
import Footer from "./components/Footer.vue";
import axios from "axios";
import { onMounted, provide, ref } from "vue";

const events = ref([]);
const students = ref([]);
provide("events", events);
provide("events", events);

onMounted(() => {
  const eventsData = {
    method: "GET",
    url: "https://ndb.3xbun.com/api/v2/tables/mqdt1iaupd641lf/records",
    params: {
      offset: "0",
      limit: "100",
      where: "",
      viewId: "vwu7qjq0bmxdes2t",
    },
    headers: {
      "xc-token": "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw",
    },
  };

  axios
    .request(eventsData)
    .then((res) => (events.value = res.data.list))
    .catch((err) => console.error(err));
});
</script>
