<template>
  <div class="container">
    <div class="page-header">
      <button class="back-btn" @click="router.go(-1)">
        <i class="fa-duotone fa-solid fa-angle-left"></i>
      </button>
      <i :class="`fa-duotone fa-solid ${loc?.icon || 'fa-location-dot'} title-icon`"></i>
      <h1>{{ locName }}</h1>
    </div>

    <template v-if="loc">
      <section class="map-card">
        <div class="map-head">
          <h3 class="section-title" style="margin: 0">แผนที่</h3>
          <router-link to="/map" class="map-full">
            <i class="fa-duotone fa-solid fa-expand"></i> แผนที่ภาพรวม
          </router-link>
        </div>
        <div class="map-img">
          <img :src="loc.map" :alt="locName" />
        </div>
      </section>

      <section class="schedule">
        <h3 class="section-title">
          กำหนดการ
          <span class="count">({{ sorted.length }} รายการ)</span>
        </h3>

        <div v-if="allDay.length" class="slot all-day">
          <div class="slot-time">{{ allDayLabel }}</div>
          <div class="events">
            <div v-for="ev in allDay" :key="ev.Id" class="event">
              <div class="event-dot"></div>
              <div class="event-title">{{ ev.Title }}</div>
              <div class="event-meta">ตลอดทั้งวัน</div>
            </div>
          </div>
        </div>

        <div v-if="slots.length" class="slots">
          <div v-for="slot in slots" :key="slot.label" class="slot">
            <div class="slot-time">{{ slot.label }}</div>
            <div class="events">
              <div v-for="ev in slot.events" :key="ev.Id" class="event">
                <div class="event-dot"></div>
                <div class="event-title">{{ ev.Title }}</div>
                <div class="event-meta">{{ slot.from }} – {{ slot.to }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!allDay.length && !slots.length" class="empty">ยังไม่มีกำหนดการ</div>
      </section>
    </template>

    <div v-else class="empty">ไม่พบสถานที่นี้</div>
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

// All-day events have no start/end time in NocoDB
const allDay = computed(() => sorted.value.filter((e) => !e.StartTime));

// Byte-correct Thai "ตลอดทั้งวัน" (sourced from the events spreadsheet)
const allDayLabel = "\u0e15\u0e25\u0e2d\u0e14\u0e17\u0e31\u0e49\u0e07\u0e27\u0e31\u0e19";

const slots = computed(() => {
  const map = new Map();
  for (const ev of sorted.value) {
    if (!ev.StartTime) continue; // all-day events go in the allDay group
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
.map-card {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  padding: 1.1rem;
  box-shadow: var(--md-shadow);
  margin-bottom: 2rem;
}
.map-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}
.map-full {
  font-size: 0.9rem;
  color: var(--md-accent);
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
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

.schedule .slots {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.slot-time {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--md-accent);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.slot-time::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--md-border);
}
.all-day {
  background: var(--md-accent-soft);
  border: 1px solid #cdd9f7;
  border-radius: 1rem;
  padding: 1rem 1.1rem;
  margin-bottom: 1.25rem;
}
.all-day .slot-time {
  color: var(--md-accent);
}
.all-day .event {
  background: var(--md-surface);
}
.all-day .event-dot {
  background: var(--md-gold);
}
.events {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.event {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 0.85rem;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  box-shadow: var(--md-shadow);
}
.event-dot {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: var(--md-accent);
  margin-top: 0.45rem;
  flex-shrink: 0;
}
.event-title {
  font-weight: 500;
  color: var(--md-text);
}
.event-meta {
  font-size: 0.85rem;
  color: var(--md-text-muted);
  margin-top: 0.15rem;
}
.empty {
  color: var(--md-text-muted);
  padding: 2rem 0;
}
</style>
