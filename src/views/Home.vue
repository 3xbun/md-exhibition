<template>
  <div class="container">
    <div class="logo">
      <img src="/imgs/logo-alternate.png" alt="" />
    </div>
    <h1>MD Exhibition</h1>
    <h2>
      งานนิทรรศการประจำปี <br />
      โรงเรียนมาแตร์เดอีวิทยาลัย
    </h2>
    <nav>
      <ul>
        <router-link to="map">
          <li class="nav-item">
            <i class="fa-duotone fa-solid fa-map-location-dot"></i> แผนที่
          </li>
        </router-link>
        <router-link to="/timetable">
          <li class="nav-item">
            <i class="fa-duotone fa-solid fa-list-ol"></i> กำหนดการ
          </li>
        </router-link>
      </ul>
      <router-link to="search">
        <p class="nav-item">
          <i class="fa-duotone fa-solid fa-address-card"></i>
          ค้นหาด้วยเลขประจำตัวนักเรียน
        </p>
      </router-link>
    </nav>
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
import PostIt from "../components/PostIt.vue";
import { onMounted, ref } from "vue";
import axios from "axios";

const msgs = ref([]);

onMounted(() => {
  const options = {
    method: "GET",
    url: "https://ndb.3xbun.com/api/v2/tables/m238nf5zt2oz5a3/records",
    params: { offset: "0", limit: "25", where: "", viewId: "vwinzzllft9ikpls" },
    headers: {
      "xc-token": "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw",
    },
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
}

ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
  margin-bottom: 1em;
}

a {
  width: calc(50% - 0.5em);
}

.nav-item {
  padding: 0.5em 0;
  border-radius: 0.5em;
  text-align: center;
  color: var(--md-blue-darker);
  background-color: var(--md-gray);
  cursor: pointer;
}

p.nav-item {
  width: 100%;
  margin: auto;
}

.contents {
  margin: 1em 0;
}

.posts {
  display: flex;
  flex-wrap: wrap;
  /* gap: 0.5em; */
  /* flex-flow: column wrap; */
  width: 100%;
}

.post {
  width: calc(50% - 0.5em);
  height: calc(50% - 0.5em);
  padding: 0.5em;
  color: var(--md-background);
  border-radius: 0.1em;
}

@media (max-width: 768px) {
  .post {
    width: 100%;
  }
}
</style>
