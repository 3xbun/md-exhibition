<template>
  <div class="container">
    <div class="page-header">
      <button class="back-btn" @click="router.go(-1)">
        <i class="fa-duotone fa-solid fa-angle-left"></i>
      </button>
      <i class="fa-duotone fa-solid fa-map-location-dot title-icon"></i>
      <h1>{{ t("map.title") }}</h1>
    </div>

    <section class="map-card">
      <h3 class="section-title">{{ t("map.overall") }}</h3>
      <div class="map-img">
        <a href="/imgs/maps/map-overall.jpeg" target="_blank">
          <img src="/imgs/maps/map-overall.jpeg" :alt="t('map.overall')" />
        </a>
      </div>
    </section>

    <section class="map-card">
      <h3 class="section-title">{{ t("map.gym") }}</h3>
      <div class="map-img">
        <a href="/imgs/maps/map-gymnasium.jpeg" target="_blank">
          <img src="/imgs/maps/map-gymnasium.jpeg" :alt="t('map.gym')" />
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
import router from "../routers";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<style scoped>
.map-card {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  padding: 1.1rem;
  box-shadow: var(--md-shadow);
  margin-bottom: 2rem;
}
.map-img {
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid var(--md-border);
  background: var(--md-surface-2);
}
.map-img img {
  min-height: 180px;
  object-fit: cover;
}
</style>
