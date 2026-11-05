<template>
  <div class="container">
    <div class="logo">
      <img src="/imgs/logo-alternate.png" alt="" />
    </div>
    <h1>MD Exhibition</h1>
    <h2>งานนิทรรศการประจำปี <br />โรงเรียนมาแตร์เดอีวิทยาลัย</h2>

    <nav>
      <router-link to="/map" class="nav-item">
        <i class="fa-duotone fa-solid fa-map-location-dot"></i> แผนที่
      </router-link>
      <router-link to="/search" class="nav-item">
        <i class="fa-duotone fa-solid fa-address-card"></i>
        ค้นหาด้วยเลขประจำตัวนักเรียน
      </router-link>
    </nav>

    <h2>สถานที่จัดกิจกรรม</h2>
    <div class="locations">
      <router-link
        v-for="loc in locations"
        :key="loc.name"
        :to="`/location/${encodeURIComponent(loc.name)}`"
        class="location-card"
      >
        <div class="location-name">{{ loc.name }}</div>
        <div class="location-count">
          {{ programCount(loc.name) }} รายการ
        </div>
      </router-link>
    </div>

    <div class="contents">
      <img src="/imgs/msg-1.jpg" alt="" />
      <img src="/imgs/msg-2.jpg" alt="" />
    </div>

    <br />
    <h2>ข้อความจากกลุ่มสาระของเรา</h2>
    <br />
    <div class="posts">
      <PostIt
        class="post"
        v-for="(msg, index) in msgs"
        :key="index"
        :seed="index"
        :title="msg.Title"
        :msg="msg.Message"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import axios from "axios";
import PostIt from "../components/PostIt.vue";
import { locations } from "../data/locations.js";

const events = inject("events");
const msgs = ref([]);

const programCount = (name) =>
  events.value.filter((e) => e.Location === name).length;

onMounted(() => {
  const options = {
    method: "GET",
    url: "https://ndb.3xbun.com/api/v2/tables/m238nf5zt2oz5a3/records",
    params: { offset: "0", limit: "25", where: "", viewId: "vwinzzllft9ikpls" },
    headers: { "xc-token": "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw" },
  };
  axios
    .request(options)
    .then((res) => (msgs.value = res.data.list))
    .catch((err) => console.error(err));
});
</script>

<style scoped>
.logo {
  margin: auto;
  width: 25%;
  border-radius: 50%;
}
h1,
h2 {
  text-align: center;
}
h2 {
  color: var(--md-gray);
}

nav {
  margin: 2em 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
}

.nav-item {
  padding: 0.5em 1em;
  border-radius: 0.5em;
  text-align: center;
  color: var(--md-blue-darker);
  background-color: var(--md-gray);
  cursor: pointer;
}

.locations {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin: 1em 0;
}
.location-card {
  flex: 1 1 calc(50% - 0.5em);
  min-width: 140px;
  padding: 1.2em;
  border-radius: 0.75em;
  background-color: var(--md-blue-dark);
  border: 1px solid var(--md-gray-dark);
  text-align: center;
  color: var(--md-white);
  transition: transform 0.12s ease;
}
.location-card:hover {
  transform: translateY(-2px);
}
.location-name {
  font-size: 1.15em;
  font-weight: 600;
}
.location-count {
  margin-top: 0.5em;
  color: var(--md-gold);
  font-size: 0.9em;
}

.contents {
  margin: 1em 0;
}
.posts {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
.post {
  width: calc(50% - 0.5em);
}
@media (max-width: 600px) {
  .post {
    width: 100%;
  }
  .location-card {
    flex: 1 1 100%;
  }
}
</style>
