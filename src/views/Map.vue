<template>
  <div class="container">
    <div class="header">
      <i class="fa-duotone fa-solid fa-angle-left" @click="router.go(-1)"></i>
      <i class="fa-duotone fa-solid fa-map-location-dot"></i>
      <h1>แผนที่</h1>
    </div>
    <div class="contents">
      <h3>แผนที่ภาพรวม</h3>
      <img src="/imgs/maps/map-overall.jpg" alt="" /> <br />
      <br />

      <h3>แผนที่ในอาคารอนุสสรณ์ 50 ปี</h3>
      <img src="/imgs/maps/map-gymnasium.jpg" alt="" />
    </div>
  </div>
</template>

<script setup>
import router from "../routers";
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
  gap: 0.5em;
}

h3 {
  color: var(--md-white);
}
</style>
