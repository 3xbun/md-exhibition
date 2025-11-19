<template>
  <div class="container">
    <div class="header">
      <i class="fa-duotone fa-solid fa-angle-left" @click="router.go(-1)"></i>
      <i class="fa-duotone fa-solid fa-map-location-dot"></i>
      <h1>แผนที่</h1>
    </div>
    <div class="contents">
      <img src="/imgs/map.png" alt="" />
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
</style>
