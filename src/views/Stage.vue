<template>
  <div class="container">
    <div v-if="loc">
      <div class="page-header">
        <i :class="`fa-duotone fa-solid ${loc.icon || 'fa-location-dot'} title-icon`"></i>
        <h1>{{ stageName }}</h1>
      </div>

      <section class="point-card" :class="status">
        <i
          :class="
            status === 'new'
              ? 'fa-duotone fa-solid fa-circle-check'
              : status === 'repeat'
                ? 'fa-duotone fa-solid fa-star'
                : 'fa-duotone fa-solid fa-triangle-exclamation'
          "
          class="point-icon"
        ></i>
        <h2 class="point-title">
          <template v-if="status === 'new'">{{ th.collected_now }}</template>
          <template v-else-if="status === 'repeat'">{{ th.already_collected }}</template>
          <template v-else-if="error">{{ th.collect_failed }}</template>
          <template v-else>{{ th.stage_title }}</template>
        </h2>
        <p class="point-count">
          <span class="count-num">{{ collected.length }}</span>
          / {{ locations.length }} {{ th.points_count }}
        </p>
      </section>

      <section class="progress">
        <div
          v-for="l in locations"
          :key="l.name"
          class="progress-item"
          :class="{ done: collected.includes(l.name) }"
        >
          <i
            :class="
              collected.includes(l.name)
                ? 'fa-duotone fa-solid fa-circle-check'
                : 'fa-duotone fa-regular fa-circle'
            "
          ></i>
          <span>{{ l.name }}</span>
        </div>
      </section>
    </div>

    <div v-else class="empty">{{ th.stage_not_found }}</div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { locations } from "../data/locations.js";
import { th } from "../copy/th.js";
import { getCollectedStages, collectStagePoint } from "../api/stageTraffic.js";

const route = useRoute();
const stageName = decodeURIComponent(route.params.name);
const loc = computed(() => locations.find((l) => l.name === stageName));

const collected = ref(getCollectedStages());
const status = ref(""); // "" | "new" | "repeat"
const error = ref(false);

onMounted(async () => {
  if (!loc.value) return;
  const wasCollected = collected.value.includes(stageName);
  const res = await collectStagePoint(stageName);
  collected.value = getCollectedStages();
  if (!res.ok) {
    error.value = true;
    return;
  }
  status.value = wasCollected ? "repeat" : "new";
});
</script>

<style scoped>
.point-card {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  box-shadow: var(--md-shadow);
  padding: 2rem 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
}
.point-card.new {
  border-color: #bfe3cf;
  background: #f3fbf6;
}
.point-card.repeat {
  border-color: #dfe6fb;
}
.point-icon {
  font-size: 2.6rem;
  color: var(--md-accent);
}
.point-card.new .point-icon {
  color: #2f9e63;
}
.point-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0.6rem 0 0.4rem;
}
.point-count {
  color: var(--md-text-soft);
  font-size: 1rem;
  margin: 0;
}
.count-num {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--md-accent);
  margin-right: 0.2rem;
}
.progress {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  box-shadow: var(--md-shadow);
  padding: 1rem 1.25rem;
  display: grid;
  gap: 0.5rem;
}
.progress-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--md-text-muted);
  font-weight: 500;
}
.progress-item.done {
  color: #2f9e63;
  font-weight: 600;
}
.empty {
  text-align: center;
  color: var(--md-text-muted);
  padding: 3rem 0;
}
</style>
