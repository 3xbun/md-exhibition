<template>
  <div class="container">
    <div class="page-header">
      <button class="back-btn" @click="router.go(-1)">
        <i class="fa-duotone fa-solid fa-angle-left"></i>
      </button>
      <i class="fa-duotone fa-solid fa-address-card title-icon"></i>
      <h1>ค้นหาด้วยเลขประจำตัวนักเรียน</h1>
    </div>

    <div class="searchBar">
      <input
        type="text"
        class="stdID"
        placeholder="กรอกเลขประจำตัว"
        v-model="stdID"
        @keypress.enter="searchStudent()"
      />
      <button class="searchBtn" @click="searchStudent()">
        <i class="fa-duotone fa-magnifying-glass"></i>
        <span>ค้นหา</span>
      </button>
    </div>

    <div class="student" v-if="student">
      <div class="student-card">
        <div class="student-id">{{ student.StudentID }}</div>
        <div class="student-name">
          {{ student.FirstName }} {{ student.LastName }}
        </div>
        <div class="student-class">{{ student.Classroom }}</div>
      </div>

      <div class="results">
        <div v-if="student.Duty" class="group">
          <h3 class="group-title">หน้าที่</h3>
          <div class="row duty">
            <span class="row-title">{{ student.Duty }}</span>
            <span class="row-time">
              {{ formatTime(student.DutyTime, 0) }}
            </span>
          </div>
        </div>

        <div v-if="student.Events > 0" class="group">
          <h3 class="group-title">กิจกรรม</h3>
          <div
            v-for="(title, index) in student.Title"
            :key="index"
            class="row"
          >
            <span class="row-title">{{ title }}</span>
            <span class="row-time">
              {{ formatTime(student.StartTime[index], student.EndTime[index]) }}
            </span>
            <router-link to="/map" class="row-loc">
              {{ student.Location[index] }}
              <i class="fa-duotone fa-map-location"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <p v-else-if="searched" class="no-result">ไม่พบนักเรียน</p>
  </div>
</template>

<script setup>
import axios from "axios";
import router from "../routers";
import { ref } from "vue";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

const student = ref("");
const stdID = ref("");
const searched = ref(false);

const searchStudent = () => {
  const studentsData = {
    method: "GET",
    url: "https://ndb.3xbun.com/api/v2/tables/mwfbjodbvl2b76n/records",
    params: {
      offset: "0",
      limit: "10",
      where: `(StudentID,eq,${stdID.value})`,
      viewId: "vwdwhufmh2erw8a8",
    },
    headers: { "xc-token": "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw" },
  };

  axios
    .request(studentsData)
    .then((res) => {
      student.value = res.data.list[0];
      searched.value = true;
    })
    .catch((err) => console.error(err));
};

const formatTime = (start, end) => {
  dayjs.extend(customParseFormat);

  if (end == 0) {
    const time = start.split("-");
    const s = dayjs(time[0], "HH:mm");
    const e = dayjs(time[1], "HH:mm");

    if (e.format("HH:mm") == "Invalid Date") {
      return "ตั้งแต่ " + s.format("HH:mm");
    }

    return `${s.format("HH:mm")} – ${e.format("HH:mm")}`;
  }

  const s = dayjs(start, "HH:mm:ss");
  const e = dayjs(end, "HH:mm:ss");
  return `${s.format("HH:mm")} – ${e.format("HH:mm")}`;
};
</script>

<style scoped>
.searchBar {
  display: flex;
  align-items: center;
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: var(--md-shadow);
  max-width: 560px;
  margin: 0 auto 2rem;
}
input {
  flex: 1;
  padding: 0.9rem 1.25rem;
  background: transparent;
  border: none;
  outline: none;
  color: var(--md-text);
  font-size: 1rem;
  min-width: 0;
}
input::placeholder {
  color: var(--md-text-muted);
}
.searchBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--md-accent);
  color: #fff;
  border: none;
  padding: 0.9rem 1.6rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.student-card {
  text-align: center;
  background: linear-gradient(135deg, var(--md-accent), #1f3f9e);
  color: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--md-shadow-lg);
  margin-bottom: 1.5rem;
}
.student-id {
  font-size: 1.3rem;
  font-weight: 600;
}
.student-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 0.25rem;
}
.student-class {
  margin-top: 0.25rem;
  font-weight: 300;
  opacity: 0.92;
}

.results {
  display: grid;
  gap: 1.5rem;
}
.group-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--md-text);
  margin-bottom: 0.6rem;
}
.row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.75rem;
  align-items: center;
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 0.85rem;
  padding: 0.8rem 1rem;
  box-shadow: var(--md-shadow);
  margin-bottom: 0.5rem;
}
.row-title {
  font-weight: 500;
}
.row-time {
  color: var(--md-text-soft);
  font-size: 0.9rem;
  white-space: nowrap;
}
.row-loc {
  color: var(--md-accent);
  font-size: 0.9rem;
  white-space: nowrap;
  font-weight: 500;
}
.no-result {
  text-align: center;
  color: var(--md-text-muted);
  padding: 2rem 0;
}

@media (max-width: 600px) {
  .row {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
}
</style>
