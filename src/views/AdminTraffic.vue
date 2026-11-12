<template>
  <div class="container">
    <AdminPinGate @unlocked="onUnlocked">
      <div class="page-header">
        <button class="back-btn" @click="router.go(-1)">
          <i class="fa-duotone fa-solid fa-angle-left"></i>
        </button>
        <i class="fa-duotone fa-solid fa-chart-column title-icon"></i>
        <h1>{{ th.traffic_title }} <span class="count">{{ total }} {{ th.traffic_total }}</span></h1>
      </div>

      <p class="traffic-sub">{{ th.traffic_sub }}</p>
      <div class="traffic-actions">
        <router-link to="/admin" class="pill-link">
          <i class="fa-duotone fa-solid fa-id-badge"></i>
          <span>{{ th.admin_title }}</span>
        </router-link>
        <button class="pill-link" @click="load(true)">
          <i class="fa-duotone fa-solid fa-rotate"></i>
          <span>{{ th.confirm_btn }}</span>
        </button>
      </div>

      <div class="traffic-table" v-if="rows.length">
        <div class="thead">
          <span>{{ th.col_stage }}</span>
          <span>{{ th.col_points }}</span>
          <span>{{ th.col_last }}</span>
        </div>
        <div v-for="r in rows" :key="r.stage" class="trow">
          <span class="c-stage">{{ r.stage }}</span>
          <span class="c-points">{{ r.points }}</span>
          <span class="c-date">{{ formatDate(r.lastAt) }}</span>
        </div>
      </div>
      <p v-else-if="loaded" class="no-result">{{ th.traffic_empty }}</p>

      <section class="qr-section">
        <h3 class="section-title">{{ th.qr_section }}</h3>
        <p class="traffic-sub">{{ th.qr_sub }}</p>
        <div class="qr-grid">
          <div v-for="loc in locations" :key="loc.name" class="qr-card">
            <QrCanvas :text="stageUrl(loc.name)" :size="180" />
            <div class="qr-name">{{ loc.name }}</div>
            <div class="qr-url">{{ stageUrl(loc.name) }}</div>
            <a
              class="qr-download"
              v-if="qrUrls[loc.name]"
              :href="qrUrls[loc.name]"
              :download="`md-stage-${encodeURIComponent(loc.name)}.png`"
            >
              <i class="fa-duotone fa-solid fa-download"></i>
              <span>{{ th.qr_download }}</span>
            </a>
          </div>
        </div>
      </section>
    </AdminPinGate>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import router from "../routers";
import dayjs from "dayjs";
import { th } from "../copy/th.js";
import AdminPinGate from "../components/AdminPinGate.vue";
import QrCanvas from "../components/QrCanvas.vue";
import { isUnlocked } from "../api/adminAuth.js";
import { getStageTraffic } from "../api/stageTraffic.js";
import { locations } from "../data/locations.js";

const QR_BASE = "https://md-exhibition.pages.dev";

const rows = ref([]);
const loaded = ref(false);

const total = computed(() => rows.value.reduce((s, r) => s + r.points, 0));

async function load(force = false) {
  if (loaded.value && !force) return;
  loaded.value = true;
  rows.value = await getStageTraffic();
}

function onUnlocked() {
  load();
  buildQrUrls();
}

onMounted(() => {
  if (isUnlocked()) onUnlocked();
});

const stageUrl = (name) => `${QR_BASE}/stage/${encodeURIComponent(name)}`;

// QR PNG data-URLs for downloading (same payload the canvases render).
import * as QRCode from "qrcode";
const qrUrls = ref({});
async function buildQrUrls() {
  for (const loc of locations) {
    qrUrls.value[loc.name] = await QRCode.toDataURL(stageUrl(loc.name), {
      width: 480,
      margin: 2,
      color: { dark: "#1b2436", light: "#ffffff" },
    });
  }
}

const formatDate = (iso) =>
  iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "";
</script>

<style scoped>
.traffic-sub {
  color: var(--md-text-soft);
  margin-bottom: 0.75rem;
}
.count {
  color: var(--md-text-muted);
  font-size: 1rem;
  font-weight: 400;
}
.traffic-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.pill-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.3rem;
  border-radius: 999px;
  border: 1px solid var(--md-border);
  background: var(--md-surface);
  color: var(--md-text);
  font-size: 0.95rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  box-shadow: var(--md-shadow);
}
.traffic-table {
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  overflow: hidden;
  background: var(--md-surface);
  box-shadow: var(--md-shadow);
  margin-bottom: 2rem;
}
.thead,
.trow {
  display: grid;
  grid-template-columns: 2fr 1fr 1.4fr;
  gap: 0.75rem;
  align-items: center;
  padding: 0.8rem 1rem;
}
.thead {
  background: var(--md-surface-2);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--md-text-soft);
}
.trow {
  border-top: 1px solid var(--md-border);
}
.c-stage {
  font-weight: 600;
}
.c-points {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--md-accent);
}
.c-date {
  color: var(--md-text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
}
.no-result {
  text-align: center;
  color: var(--md-text-muted);
  padding: 2rem 0;
}
.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
}
.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}
.qr-card {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  box-shadow: var(--md-shadow);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.qr-name {
  font-weight: 700;
  text-align: center;
}
.qr-url {
  font-size: 0.65rem;
  color: var(--md-text-muted);
  word-break: break-all;
  text-align: center;
}
.qr-download {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  border: 1px solid var(--md-border);
  background: var(--md-surface);
  color: var(--md-accent);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}
.qr-download:hover {
  background: var(--md-accent-soft);
}
</style>
