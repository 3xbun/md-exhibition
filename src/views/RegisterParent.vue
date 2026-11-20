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
      <p class="form-sub">{{ typeSub }}</p>
      <form @submit.prevent="register">
        <div class="type-toggle">
          <span class="type-label">{{ th.type_label }}</span>
          <div class="type-opts">
            <button
              type="button"
              class="type-opt"
              :class="{ active: badgeType === 'parent' }"
              @click="badgeType = 'parent'"
            >
              <i class="fa-duotone fa-solid fa-user-shield"></i>
              <span>{{ th.parent_label }}</span>
            </button>
            <button
              type="button"
              class="type-opt"
              :class="{ active: badgeType === 'outside' }"
              @click="badgeType = 'outside'"
            >
              <i class="fa-duotone fa-solid fa-user-group"></i>
              <span>{{ th.outside_label }}</span>
            </button>
            <button
              type="button"
              class="type-opt"
              :class="{ active: badgeType === 'alumni' }"
              @click="badgeType = 'alumni'"
            >
              <i class="fa-duotone fa-solid fa-graduation-cap"></i>
              <span>{{ th.alumni_label }}</span>
            </button>
          </div>
        </div>
        <label class="field">
          <span>{{ th.first_name }}</span>
          <input v-model.trim="firstName" required />
        </label>
        <label class="field">
          <span>{{ th.last_name }}</span>
          <input v-model.trim="lastName" required />
        </label>
        <label class="field" v-if="badgeType === 'parent'">
          <span>{{ th.student_id }}</span>
          <input v-model.trim="studentID" required />
        </label>
        <label class="field" v-else>
          <span>{{ th.phone }}</span>
          <input
            :value="phone"
            @input="onPhoneInput"
            type="tel"
            inputmode="numeric"
            placeholder="0xx-xxx-xxxx"
            pattern="\d{3}-\d{3}-\d{4}"
            maxlength="12"
            required
          />
        </label>
        <label class="field" v-if="badgeType === 'alumni'">
          <span>{{ th.classnum_label }}</span>
          <div class="classnum-wrap">
            <span class="classnum-prefix">MD</span>
            <input
              :value="classNum"
              @input="onClassNumInput"
              inputmode="numeric"
              placeholder="101"
              required
            />
          </div>
        </label>

        <p v-if="badgeType === 'parent' && foundStudent" class="found-student">
          <i class="fa-duotone fa-solid fa-circle-check"></i>
          <span>{{ foundStudent.FirstName }} {{ foundStudent.LastName }} ({{ foundStudent.StudentID }})</span>
          <router-link to="/search">{{ th.find_student }}</router-link>
        </p>
        <p v-else-if="badgeType === 'parent' && searched && !foundStudent" class="error">{{ th.id_not_found }}</p>
        <p v-if="badgeType === 'parent' && alreadyCount" class="note">{{ th.already_registered }}</p>
        <p v-if="error" class="error">{{ error }}</p>

        <button
          type="submit"
          class="register-btn"
          :disabled="(badgeType === 'parent' ? !foundStudent : phone.length < 12) || busy"
        >
          <i class="fa-duotone fa-solid fa-id-badge"></i>
          <span>{{ th.register_btn }}</span>
        </button>
      </form>

      <!-- My Badge: open the badge saved on THIS device -->
      <div class="my-badge-block" v-if="latestBadge">
        <router-link :to="`/badge/${encodeURIComponent(latestBadge.code)}`" class="my-badge-link">
          <i class="fa-duotone fa-solid fa-id-badge"></i>
          <span>{{ th.my_badge }}</span>
        </router-link>
      </div>
    </div>

    <!-- Badge (QR) -->
    <div class="badge-wrap" v-if="registered">
      <p class="badge-sub print-hide">{{ th.badge_sub }}</p>
      <BadgeCard :parent="registered" :children="children" />
      <button class="print-btn print-hide" @click="printBadge">
        <i class="fa-duotone fa-solid fa-print"></i>
        <span>{{ th.print_btn }}</span>
      </button>
      <button class="add-btn print-hide" @click="resetForm">
        <i class="fa-duotone fa-solid fa-plus"></i>
        <span>{{ th.add_badge }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import router from "../routers";
import BadgeCard from "../components/BadgeCard.vue";
import { th } from "../copy/th.js";
import { getLatestBadge } from "../api/myBadge.js";
import {
  findMemberByStudentID,
  createParent,
  makeBadgeCode,
  getChildren,
  hasParentForMember,
} from "../api/parents.js";
import { saveMyBadge } from "../api/myBadge.js";

const firstName = ref("");
const lastName = ref("");
const studentID = ref("");
const phone = ref("");
const classNum = ref(""); // alumni: number only (system shows the "MD" prefix)
const badgeType = ref("parent"); // "parent" | "outside" | "alumni"
const typeSub = computed(
  () =>
    badgeType.value === "outside"
      ? th.outside_sub
      : badgeType.value === "alumni"
        ? th.alumni_sub
        : th.register_sub
);

const formatPhone = (raw) => {
  const d = String(raw ?? "").replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
};

const onPhoneInput = (e) => {
  const formatted = formatPhone(e.target.value);
  phone.value = formatted;
  e.target.value = formatted;
};
// Class number: digits only (max 4), the "MD" prefix is shown separately.
const onClassNumInput = (e) => {
  const d = String(e.target.value ?? "").replace(/\D/g, "").slice(0, 4);
  classNum.value = d;
  e.target.value = d;
};
const foundStudent = ref(null);
const searched = ref(false);
const alreadyCount = ref(0);
const busy = ref(false);
const error = ref("");

const registered = ref(null);
const children = ref([]);
const latestBadge = ref(getLatestBadge());
let lookupTimer = null;

// Keep "My Badge" in sync (registration, removal, cross-tab)
const refreshMyBadge = () => (latestBadge.value = getLatestBadge());
window.addEventListener("md-badge-change", refreshMyBadge);
window.addEventListener("storage", refreshMyBadge);

// Legacy entry: /register?badge=MD-XXXXXX now redirects to /badge/:code
onMounted(() => {
  const code = new URLSearchParams(window.location.search).get("badge");
  if (code) {
    router.replace(`/badge/${encodeURIComponent(code)}`);
  }
});
onUnmounted(() => {
  window.removeEventListener("md-badge-change", refreshMyBadge);
  window.removeEventListener("storage", refreshMyBadge);
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
  if (badgeType.value === "parent" && !foundStudent.value) {
    await lookUpStudent();
    if (!foundStudent.value) return;
  }
  busy.value = true;
  error.value = "";
  try {
    const code = await makeBadgeCode(badgeType.value);
    const rec = await createParent(
      {
        FirstName: firstName.value,
        LastName: lastName.value,
        BadgeCode: code,
        Type: badgeType.value,
        Phone:
          badgeType.value !== "parent" ? phone.value : undefined,
        ClassNumber:
          badgeType.value === "alumni" ? `MD${classNum.value}` : undefined,
      },
      badgeType.value === "parent" ? foundStudent.value.Id : null
    );
    registered.value = rec.fields;
    children.value = badgeType.value === "parent" ? await getChildren(rec.id) : [];
    // keep the badge on this device for easy re-access (no password)
    saveMyBadge({
      code: rec.fields.BadgeCode,
      name: `${rec.fields.FirstName} ${rec.fields.LastName}`,
      type: rec.fields.Type,
    });
    refreshMyBadge();
  } catch (e) {
    console.error(e);
    error.value = "Error";
  } finally {
    busy.value = false;
  }
};

const printBadge = () => window.print();

const resetForm = () => {
  registered.value = null;
  children.value = [];
  firstName.value = "";
  lastName.value = "";
  studentID.value = "";
  phone.value = "";
  classNum.value = "";
  foundStudent.value = null;
  searched.value = false;
  alreadyCount.value = 0;
  error.value = "";
};

watch(studentID, (v) => {
  if (badgeType.value !== "parent") return;
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
.type-toggle {
  margin-bottom: 1.1rem;
}
.type-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--md-text-soft);
  margin-bottom: 0.4rem;
}
.type-opts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.type-opt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem;
  border: 1.5px solid var(--md-border);
  border-radius: 0.7rem;
  background: var(--md-bg);
  color: var(--md-text-soft);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s ease;
}
.type-opt.active {
  border-color: var(--md-accent);
  background: var(--md-accent-soft);
  color: var(--md-accent);
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
/* Class-number field (alumni): fixed "MD" prefix + digits-only input */
.classnum-wrap {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--md-border);
  border-radius: 0.7rem;
  background: var(--md-bg);
  overflow: hidden;
}
.classnum-wrap:focus-within {
  border-color: var(--md-accent);
  background: var(--md-surface);
}
.classnum-prefix {
  display: flex;
  align-items: center;
  padding: 0 0.9rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--md-accent);
  background: var(--md-accent-soft);
  border-right: 1px solid var(--md-border);
}
.classnum-wrap input {
  flex: 1;
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  padding: 0.75rem 0.9rem;
  font-size: 1rem;
  font-family: inherit;
  color: var(--md-text);
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
.my-badge-block {
  margin-top: 1.1rem;
}
.my-badge-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--md-accent);
  background: var(--md-accent-soft);
  color: var(--md-accent);
  font-size: 1rem;
  font-weight: 600;
  transition: transform 0.15s ease;
}
.my-badge-link:hover {
  transform: translateY(-1px);
}
.my-badge-link span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.7rem 1.4rem;
  border: 1px solid var(--md-accent);
  border-radius: 999px;
  background: var(--md-accent-soft);
  color: var(--md-accent);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.add-btn:hover {
  transform: translateY(-1px);
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
