<template>
  <div class="container">
    <div class="page-header print-hide">
      <button class="back-btn" @click="router.go(-1)">
        <i class="fa-duotone fa-solid fa-angle-left"></i>
      </button>
      <i class="fa-duotone fa-solid fa-id-badge title-icon"></i>
      <h1>{{ th.register_title }}</h1>
    </div>

    <!-- Registration form -->
    <div class="form-card print-hide" v-if="!registered">
      <p class="form-sub">{{ th.register_sub }}</p>
      <form @submit.prevent="register">
        <label class="field">
          <span>{{ th.first_name }}</span>
          <input v-model.trim="firstName" required />
        </label>
        <label class="field">
          <span>{{ th.last_name }}</span>
          <input v-model.trim="lastName" required />
        </label>
        <label class="field">
          <span>{{ th.student_id }}</span>
          <input v-model.trim="studentID" required />
        </label>

        <p v-if="foundStudent" class="found-student">
          <i class="fa-duotone fa-solid fa-circle-check"></i>
          <span>{{ foundStudent.FirstName }} {{ foundStudent.LastName }} ({{ foundStudent.StudentID }})</span>
          <router-link to="/search">{{ th.find_student }}</router-link>
        </p>
        <p v-else-if="searched && !foundStudent" class="error">{{ th.id_not_found }}</p>
        <p v-if="alreadyCount" class="note">{{ th.already_registered }}</p>
        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" class="register-btn" :disabled="!foundStudent || busy">
          <i class="fa-duotone fa-solid fa-id-badge"></i>
          <span>{{ th.register_btn }}</span>
        </button>
      </form>
    </div>

    <!-- Badge (QR) -->
    <div class="badge-wrap" v-if="registered">
      <p class="badge-sub print-hide">{{ th.badge_sub }}</p>
      <div class="badge">
        <div class="badge-head">
          <img src="/imgs/logo-alternate.png" alt="" class="badge-logo" />
          <div>
            <div class="badge-school">MD Exhibition</div>
            <div class="badge-type">{{ th.badge_title }}</div>
          </div>
        </div>
        <div class="badge-name">{{ registered.FirstName }} {{ registered.LastName }}</div>
        <div class="badge-code">{{ registered.BadgeCode }}</div>
        <div class="badge-children">
          <span class="badge-label">{{ th.child_label }}</span>
          <span v-for="kid in children" :key="kid.id" class="chip">{{ kid.fields?.StudentID }}</span>
        </div>
        <canvas ref="qrCanvas"></canvas>
      </div>
      <button class="print-btn print-hide" @click="printBadge">
        <i class="fa-duotone fa-solid fa-print"></i>
        <span>{{ th.print_btn }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import * as QRCode from "qrcode";
import { ref, watch, onMounted } from "vue";
import router from "../routers";
import { th } from "../copy/th.js";
import {
  findMemberByStudentID,
  createParent,
  makeBadgeCode,
  getChildren,
  findParentByBadgeCode,
  hasParentForMember,
} from "../api/parents.js";

const firstName = ref("");
const lastName = ref("");
const studentID = ref("");
const foundStudent = ref(null);
const searched = ref(false);
const alreadyCount = ref(0);
const busy = ref(false);
const error = ref("");

const registered = ref(null);
const children = ref([]);
const qrCanvas = ref(null);
let lookupTimer = null;

// Re-open by badge code (e.g. link/QR sent to the parent's phone)
onMounted(async () => {
  const code = new URLSearchParams(window.location.search).get("badge");
  if (!code) return;
  const rec = await findParentByBadgeCode(code);
  if (!rec?.fields) return;
  registered.value = rec.fields;
  children.value = await getChildren(rec.id);
  drawQr(rec.fields.BadgeCode);
});

const lookUpStudent = async () => {
  searched.value = true;
  error.value = "";
  foundStudent.value = null;
  try {
    const member = await findMemberByStudentID(studentID.value);
    foundStudent.value = member;
    if (member) {
      alreadyCount.value = (await hasParentForMember(member.Id)) ? 1 : 0;
    }
  } catch (e) {
    console.error(e);
    error.value = "Lookup failed, please try again";
  }
};

const register = async () => {
  if (!foundStudent.value) {
    await lookUpStudent();
    if (!foundStudent.value) return;
  }
  busy.value = true;
  error.value = "";
  try {
    const code = await makeBadgeCode();
    const rec = await createParent(
      { FirstName: firstName.value, LastName: lastName.value, BadgeCode: code },
      foundStudent.value.Id
    );
    registered.value = rec.fields;
    children.value = await getChildren(rec.id);
    drawQr(code);
  } catch (e) {
    console.error(e);
    error.value = "Error";
  } finally {
    busy.value = false;
  }
};

const drawQr = (text) => {
  if (!qrCanvas.value) return;
  QRCode.toCanvas(qrCanvas.value, text, { width: 220, margin: 1, color: { dark: "#1b2436", light: "#ffffff" } });
};

const printBadge = () => window.print();

watch(studentID, (v) => {
  if (v.length >= 3) {
    // debounce: per-keystroke queries get rate-limited (401) by the API
    if (lookupTimer) clearTimeout(lookupTimer);
    lookupTimer = setTimeout(lookUpStudent, 400);
  } else {
    searched.value = false;
    foundStudent.value = null;
  }
});
</script>

<style scoped>
.form-card {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  box-shadow: var(--md-shadow);
  padding: 1.5rem;
  max-width: 560px;
  margin: 0 auto;
}
.form-sub {
  color: var(--md-text-soft);
  margin-bottom: 1.25rem;
}
.field {
  display: block;
  margin-bottom: 1rem;
}
.field span {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--md-text-soft);
  margin-bottom: 0.3rem;
}
.field input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--md-border);
  border-radius: 0.7rem;
  font-size: 1rem;
  font-family: inherit;
  color: var(--md-text);
  background: var(--md-bg);
  outline: none;
}
.field input:focus {
  border-color: var(--md-accent);
  background: var(--md-surface);
}
.found-student {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  color: var(--md-text-soft);
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}
.found-student i {
  color: #2f9e63;
}
.found-student a {
  margin-left: auto;
  color: var(--md-accent);
  font-weight: 600;
  font-size: 0.9rem;
}
.note {
  color: var(--md-gold);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}
.error {
  color: #c0392b;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}
.register-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 999px;
  background: var(--md-accent);
  color: #fff;
  font-size: 1.05rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--md-shadow);
}
.register-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* --- Badge --- */
.badge-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.badge-sub {
  color: var(--md-text-soft);
  text-align: center;
  max-width: 420px;
}
.badge {
  width: 100%;
  max-width: 380px;
  background: linear-gradient(160deg, var(--md-accent) 0%, #1f3f9e 100%);
  color: #fff;
  border-radius: 1.25rem;
  box-shadow: var(--md-shadow-lg);
  padding: 1.5rem;
  text-align: center;
}
.badge-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.badge-logo {
  width: 34px;
  height: 34px;
  background: #fff;
  border-radius: 50%;
  padding: 2px;
}
.badge-head > div {
  text-align: left;
}
.badge-school {
  font-weight: 700;
  font-size: 0.95rem;
}
.badge-type {
  font-size: 0.8rem;
  opacity: 0.85;
}
.badge-name {
  font-size: 1.45rem;
  font-weight: 700;
}
.badge-code {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  letter-spacing: 0.12em;
  opacity: 0.9;
}
.badge-children {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.6rem;
}
.badge-label {
  font-size: 0.8rem;
  opacity: 0.8;
}
.chip {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 0.15rem 0.7rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.badge canvas {
  margin: 1rem auto 0;
  background: #fff;
  border-radius: 0.6rem;
  padding: 0.4rem;
}
.print-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 1.6rem;
  border: 1px solid var(--md-border);
  border-radius: 999px;
  background: var(--md-surface);
  color: var(--md-text);
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--md-shadow);
}

@media print {
  .print-hide {
    display: none !important;
  }
  .container {
    padding: 0;
    max-width: none;
  }
  body {
    background: #fff;
  }
}
</style>
