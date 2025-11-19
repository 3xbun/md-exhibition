<template>
  <div class="container">
    <div class="header">
      <i class="fa-duotone fa-solid fa-angle-left" @click="router.go(-1)"></i>
      <i class="fa-duotone fa-solid fa-list-ol"></i>
      <h1>กำหนดการ</h1>
    </div>
    <div class="option">
      <h3>
        สถานที่:
        <select name="location" id="location" v-model="location">
          <option value="all" selected="selected">ทั้งหมด</option>
          <option value="เวทีใหญ่">เวทีใหญ่</option>
          <option value="หอประชุม">หอประชุม</option>
          <option value="MDO">MDO</option>
          <option value="ลานอัญจลา">ลานอัญจลา</option>
          <option value="ลานอุร์สุลา">ลานอุร์สุลา</option>
        </select>
      </h3>
    </div>

    <table>
      <thead>
        <tr>
          <td>กิจกรรม</td>
          <td>เวลา</td>
          <td>สถานที่</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in filterEvents" :key="event.Id">
          <td class="title">{{ event.Title }}</td>
          <td class="time">{{ formatTime(event.StartTime, event.EndTime) }}</td>
          <td class="location">
            <router-link to="map">
              {{ event.Location }}
              <i class="fa-duotone fa-map-location"></i>
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { computed, inject, ref } from "vue";
import router from "../routers";

const events = inject("events");
const location = ref("all");

const formatTime = (start, end) => {
  dayjs.extend(customParseFormat);
  const s = dayjs(start, "HH:mm:ss");
  const e = dayjs(end, "HH:mm:ss");
  return `${s.format("HH:mm")} - ${e.format("HH:mm")}`;
};

const filterEvents = computed(() => {
  if (location.value == "all") {
    return events.value;
  } else {
    return events.value.filter((e) => e.Location == location.value);
  }
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

table {
  width: 100%;
  margin-top: 2em;
  color: var(--md-gray);
  border-collapse: collapse;
}

thead {
  font-weight: bolder;
  text-align: center;
}

td {
  padding: 0.5em 0;
}

td:first-child {
  border-radius: 0.5em 0 0 0.5em;
}

td:last-child {
  border-radius: 0 0.5em 0.5em 0;
}

tr:nth-child(even) {
  background-color: var(--md-blue-dark);
}

.title {
  padding-left: 0.5em;
}

.time {
  width: 20%;
  text-align: center;
}

.location {
  width: 40%;
  text-align: center;
}

.location i {
  color: var(--md-blue);
  font-size: 0.8rem;
}

select {
  font-size: inherit;
  background-color: var(--md-blue-dark);
  border: none;
  padding-left: 0.5em;
  color: var(--md-white);
  border-radius: 0.5em;
}

@media (max-width: 768px) {
  .time {
    width: 40%;
  }
}
</style>
