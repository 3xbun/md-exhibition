<template>
  <div class="container">
    <div class="header">
      <i class="fa-duotone fa-solid fa-angle-left" @click="router.go(-1)"></i>
      <i class="fa-duotone fa-solid fa-address-card"></i>
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
      <div class="searchBtn" @click="searchStudent()">
        <i class="fa-duotone fa-magnifying-glass"></i>
        <p>ค้นหา</p>
      </div>
    </div>

    <div class="student">
      <h2 v-if="student">
        {{ student.StudentID }} <br />
        {{ student.FirstName }} {{ student.LastName }}
        <br />
        {{ student.Classroom }}
      </h2>

      <table v-if="student">
        <tr v-for="(title, index) in student.Title" :key="index">
          <td class="title">{{ title }}</td>
          <td class="time">
            {{ formatTime(student.StartTime[index], student.EndTime[index]) }}
          </td>
          <td class="location">
            <router-link to="map">
              {{ student.Location[index] }}
              <i class="fa-duotone fa-map-location"></i>
            </router-link>
          </td>
        </tr>
      </table>
    </div>
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
const error = false;

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
    headers: {
      "xc-token": "3jFXBW3Q7u8bG1ITW0SevPfYNoi_mDfICFORPSkw",
    },
  };

  axios
    .request(studentsData)
    .then((res) => (student.value = res.data.list[0]))
    .catch((err) => console.error(err));
};

const formatTime = (start, end) => {
  dayjs.extend(customParseFormat);
  const s = dayjs(start, "HH:mm:ss");
  const e = dayjs(end, "HH:mm:ss");
  return `${s.format("HH:mm")} - ${e.format("HH:mm")}`;
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  margin-bottom: 1em;
  gap: 0.5em;
}

h1 {
  font-size: 1.3rem;
}

h2 {
  margin: 1em 0;
}

.searchBar {
  border-radius: 0.5em;
  overflow: hidden;
  display: flex;
  width: 80%;
  margin: auto;
}

input {
  width: 100%;
  background-color: var(--md-blue-dark);
  outline: none;
  border: none;
  color: var(--md-white);
  padding-left: 1em;
  font-size: inherit;
}

input::placeholder {
  color: var(--md-gray-dark);
}

.searchBtn {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--md-blue);
  color: var(--md-white);
  font-weight: 300;
  padding: 0.25em 0.5em;
  gap: 0.1em;
}

table {
  width: 100%;
  margin-top: 1em;
  color: var(--md-gray);
  border-collapse: collapse;
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

@media (max-width: 768px) {
  .time {
    width: 40%;
  }
}
</style>
