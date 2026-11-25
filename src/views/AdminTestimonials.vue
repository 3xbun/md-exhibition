<template>
  <div class="container">
    <AdminPinGate @unlocked="load">
      <div class="page-header">
        <button class="back-btn" @click="router.go(-1)">
          <i class="fa-duotone fa-solid fa-angle-left"></i>
        </button>
        <i class="fa-duotone fa-solid fa-quote-left title-icon"></i>
        <h1>
          {{ th.testi_admin_title }}
          <span class="count">{{ rows.length }}</span>
        </h1>
      </div>

      <p class="admin-sub">{{ th.testi_admin_sub }}</p>
      <div class="scan-links">
        <router-link to="/admin" class="scan-link">
          <i class="fa-duotone fa-solid fa-id-badge"></i>
          <span>{{ th.admin_title }}</span>
        </router-link>
        <button class="scan-link" @click="toggleForm">
          <i :class="`fa-duotone fa-solid ${formOpen ? 'fa-xmark' : 'fa-plus'}`"></i>
          <span>{{ th.testi_add_btn }}</span>
        </button>
      </div>

      <!-- Add / edit form -->
      <form v-if="formOpen" class="testi-form" @submit.prevent="save">
        <div class="field">
          <label>{{ th.testi_quote_label }}</label>
          <textarea
            v-model="form.Quote"
            rows="4"
            class="textarea"
            :placeholder="th.testi_quote_ph"
            required
          ></textarea>
        </div>
        <div class="field-row">
          <div class="field">
            <label>{{ th.testi_name_label }}</label>
            <input v-model="form.Name" type="text" class="input" :placeholder="th.testi_name_ph" />
          </div>
          <div class="field">
            <label>{{ th.testi_affil_label }}</label>
            <input v-model="form.Affiliation" type="text" class="input" :placeholder="th.testi_affil_ph" />
          </div>
        </div>
        <div class="field">
          <label>{{ th.testi_year_label }}</label>
          <input v-model="form.Year" type="number" class="input" :placeholder="th.testi_year_ph" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="busy">
            <i class="fa-duotone fa-solid fa-check"></i>
            <span>{{ th.testi_save_btn }}</span>
          </button>
          <button type="button" class="btn-ghost" @click="closeForm">
            {{ th.testi_cancel_btn }}
          </button>
        </div>
        <p v-if="error" class="form-error">{{ th.testi_save_failed }}</p>
      </form>

      <!-- Success flash -->
      <p v-if="flash" class="flash" :class="flashType">{{ flash }}</p>

      <!-- List -->
      <div class="testi-list" v-if="rows.length">
        <div v-for="r in rows" :key="r.id" class="testi-card">
          <div class="testi-quote">
            <i class="fa-duotone fa-solid fa-quote-left quote-mark"></i>
            <p>{{ r.fields.Quote }}</p>
          </div>
          <div class="testi-meta">
            <span class="who">
              {{ r.fields.Name }}
              <span v-if="r.fields.Affiliation" class="affil">
                {{ r.fields.Affiliation }}
              </span>
            </span>
            <span v-if="r.fields.Year" class="year-chip">{{ r.fields.Year }}</span>
          </div>
          <div class="testi-actions">
            <button class="mini-btn edit" @click="edit(r)">
              <i class="fa-duotone fa-solid fa-pen"></i>
              {{ th.testi_edit_btn }}
            </button>
            <button class="mini-btn del" @click="remove(r)">
              <i class="fa-duotone fa-solid fa-trash"></i>
              {{ th.testi_delete_btn }}
            </button>
          </div>
        </div>
      </div>
      <p v-else-if="loaded" class="no-result">{{ th.testi_empty }}</p>
    </AdminPinGate>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import router from "../routers";
import { th } from "../copy/th.js";
import AdminPinGate from "../components/AdminPinGate.vue";
import { isUnlocked } from "../api/adminAuth.js";
import {
  listTestimonials,
  saveTestimonial,
  deleteTestimonial,
} from "../api/testimonials.js";

const rows = ref([]);
const loaded = ref(false);
const busy = ref(false);
const formOpen = ref(false);
const editingId = ref(null);
const error = ref(false);
const flash = ref("");
const flashType = ref("");

const form = ref({ Quote: "", Name: "", Affiliation: "", Year: "" });

async function load() {
  if (loaded.value) return;
  loaded.value = true;
  rows.value = await listTestimonials();
}

function openForm() {
  editingId.value = null;
  form.value = { Quote: "", Name: "", Affiliation: "", Year: "" };
  error.value = false;
  formOpen.value = true;
}

function toggleForm() {
  formOpen.value ? closeForm() : openForm();
}

function closeForm() {
  formOpen.value = false;
  editingId.value = null;
}

function edit(r) {
  editingId.value = r.id;
  form.value = {
    Quote: r.fields.Quote ?? "",
    Name: r.fields.Name ?? "",
    Affiliation: r.fields.Affiliation ?? "",
    Year: r.fields.Year ?? "",
  };
  error.value = false;
  formOpen.value = true;
}

async function save() {
  if (busy.value) return;
  busy.value = true;
  error.value = false;
  try {
    const saved = await saveTestimonial(form.value, editingId.value);
    if (!saved) throw new Error("no record");
    closeForm();
    rows.value = await listTestimonials();
    showFlash(th.testi_saved, "ok");
  } catch {
    error.value = true;
  } finally {
    busy.value = false;
  }
}

async function remove(r) {
  if (!window.confirm(th.testi_confirm_delete)) return;
  try {
    await deleteTestimonial(r.id);
    rows.value = await listTestimonials();
    showFlash(th.testi_deleted, "ok");
  } catch {
    showFlash(th.testi_save_failed, "err");
  }
}

function showFlash(msg, type) {
  flash.value = msg;
  flashType.value = type;
  setTimeout(() => (flash.value = ""), 2200);
}

onMounted(() => {
  if (isUnlocked()) load();
});
</script>

<style scoped>
.admin-sub {
  color: var(--md-text-soft);
  margin-bottom: 0.75rem;
}
.count {
  color: var(--md-text-muted);
  font-size: 1rem;
  font-weight: 400;
}
.scan-links {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.scan-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.3rem;
  border-radius: 999px;
  background: var(--md-accent);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: var(--md-shadow);
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.testi-form {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  box-shadow: var(--md-shadow);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--md-text-soft);
}
.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
.input,
.textarea {
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--md-border);
  border-radius: 0.6rem;
  background: var(--md-bg);
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--md-text);
  outline: none;
  resize: vertical;
}
.input:focus,
.textarea:focus {
  border-color: var(--md-accent);
}
.form-actions {
  display: flex;
  gap: 0.6rem;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 999px;
  background: var(--md-accent);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--md-shadow);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-ghost {
  padding: 0.7rem 1.3rem;
  border: 1px solid var(--md-border);
  border-radius: 999px;
  background: var(--md-surface);
  color: var(--md-text);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.form-error {
  color: #c0392b;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}
.flash {
  margin: 0 0 1rem;
  padding: 0.65rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}
.flash.ok {
  background: #e7f4ec;
  color: #2f9e63;
}
.flash.err {
  background: #fdecec;
  color: #c0392b;
}

.testi-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.testi-card {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  box-shadow: var(--md-shadow);
  padding: 1.1rem 1.2rem;
}
.testi-quote {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
}
.quote-mark {
  color: var(--md-gold);
  font-size: 1.1rem;
  margin-top: 0.15rem;
}
.testi-quote p {
  margin: 0;
  color: var(--md-text);
  font-size: 0.98rem;
  line-height: 1.5;
  white-space: pre-wrap;
}
.testi-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 0.8rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--md-border);
}
.who {
  font-weight: 600;
  color: var(--md-text);
  font-size: 0.92rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.affil {
  font-weight: 400;
  color: var(--md-text-muted);
  font-size: 0.85rem;
}
.year-chip {
  background: var(--md-accent-soft);
  color: var(--md-accent);
  border-radius: 999px;
  padding: 0.15rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}
.testi-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.mini-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.95rem;
  border: 1px solid var(--md-border);
  border-radius: 999px;
  background: var(--md-surface-2);
  color: var(--md-text);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.mini-btn.edit:hover {
  border-color: var(--md-accent);
  color: var(--md-accent);
}
.mini-btn.del:hover {
  border-color: #c0392b;
  color: #c0392b;
}
.no-result {
  text-align: center;
  color: var(--md-text-muted);
  padding: 2rem 0;
}

@media (max-width: 600px) {
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
