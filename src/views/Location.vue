<template>
  <div class="container">
    <div class="header">
      <i class="fa-duotone fa-solid fa-angle-left" @click="router.go(-1)"></i>
      <i class="fa-duotone fa-solid fa-location-dot"></i>
      <h1>{{ locName }}</h1>
    </div>

    <template v-if="loc">
      <div class="map-block">
        <h3>แผนที่</h3>
        <div class="map-wrap">
          <img :src="loc.map" :alt="locName" />
          <router-link to="/map" class="map-full">
            <i class="fa-duotone fa-solid fa-expand"></i> แผนที่ภาพรวม
          </router-link>
        </div>
      </div>

      <div class="programs">
        <h3>กำหนดการ ({{ sorted.length }} รายการ)</h3>
        <div class="time-slots" v-if="sorted.length">
          <div v-for="slot in slots" :key="slot.label" class="slot">
            <div class="slot-label">{{ slot.label }}</div>
            <div
              v-for="ev in slot.events"
              :key="ev.Id"
              class="event"
            >
              <div class="event-title">{{ ev.Title }}</div>
              <div class="event-meta">{{ slot.from }} – {{ slot.to }}</div>
            </div>
          </div>
        </div>
        <h3 v-else class="empty">ยังไม่มีกำหนดการ</h3>
      </div>
    </template>

    <h3 v-else>ไม่พบสถานที่นี้</h3>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { locations } from "../data/locations.js";

dayjs.extend(customParseFormat);

const route = useRoute();
const router = useRouter();
const events = inject("events");

const locName = decodeURIComponent(route.params.name);
const loc = computed(() => locations.find((l) => l.name === locName));

const sorted = computed(() =>
  (events.value || [])
    .filter((e) => e.Location === locName)
    .slice()
    .sort((a, b) =>
      (a.StartTime || "00:00:00").localeCompare(b.StartTime || "00:00:00")
    )
);

const slots = computed(() => {
  const map = new Map();
  for (const ev of sorted.value) {
    const key = (ev.StartTime || "").slice(0, 5);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(ev);
  }
  return [...map.entries()].map(([from, events]) => {
    const fromT = dayjs(`2000-01-01 ${from}`, "YYYY-MM-DD HH:mm");
    const toT = fromT.add(1, "hour");
    return {
      label: `${fromT.format("HH:mm")} – ${toT.format("HH:mm")}`,
      from: fromT.format("HH:mm"),
      to: toT.format("HH:mm"),
      events,
    };
  });
});
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
  gap: 0.5em;
}
i {
  margin-top: 0.15em;
  font-size: 1.5em;
}
h3 {
  color: var(--md-white);
  margin-bottom: 0.5em;
}
.map-wrap {
  position: relative;
  margin-bottom: 1.5em;
}
.map-full {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  background: rgba(15, 28, 51, 0.85);
  padding: 0.35em 0.7em;
  border-radius: 0.5em;
  font-size: 0.85em;
  color: var(--md-white);
  border: 1px solid var(--md-gray-dark);
}
.slot {
  margin-bottom: 1em;
}
.slot-label {
  font-weight: 700;
  color: var(--md-gold);
  padding: 0.3em 0.5em;
  background: var(--md-blue-darker);
  border-radius: 0.5em;
  margin-bottom: 0.35em;
}
.event {
  background: var(--md-blue-dark);
  padding: 0.7em;
  border-radius: 0.5em;
  margin-bottom: 0.4em;
  color: var(--md-gray);
}
.event-title {
  color: var(--md-white);
}
.event-meta {
  font-size: 0.85em;
  color: var(--md-gray-light);
  margin-top: 0.2em;
}
.empty {
  color: var(--md-gray);
  font-weight: 400;
}
</style>
