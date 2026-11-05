<template>
  <div class="badge">
    <div class="badge-head">
      <img src="/imgs/logo-alternate.png" alt="" class="badge-logo" />
      <div>
        <div class="badge-school">MD Exhibition</div>
        <div class="badge-type">{{ th.badge_title }}</div>
      </div>
    </div>
    <div class="badge-name">{{ parent.FirstName }} {{ parent.LastName }}</div>
    <div class="badge-type-row">
      <span class="badge-type-chip" :class="parent.Type">
        <i :class="parent.Type === 'guest' ? 'fa-duotone fa-solid fa-user-group' : 'fa-duotone fa-solid fa-user-shield'"></i>
        {{ parent.Type === 'guest' ? th.guest_label : th.parent_label }}
      </span>
    </div>
    <div class="badge-code">{{ parent.BadgeCode }}</div>
    <div class="badge-children" v-if="children.length">
      <span class="badge-label">{{ th.child_label }}</span>
      <span v-for="kid in children" :key="kid.id" class="chip">{{ kid.fields?.StudentID }}</span>
    </div>
    <canvas ref="qrCanvas"></canvas>
    <div class="badge-url">{{ badgeUrl }}</div>
  </div>
</template>

<script setup>
import * as QRCode from "qrcode";
import { ref, onMounted, watch } from "vue";
import { th } from "../copy/th.js";

const props = defineProps({
  parent: { type: Object, required: true },
  children: { type: Array, default: () => [] },
});

const QR_BASE = "https://md-exhibition.pages.dev";
const badgeUrl = `${QR_BASE}/badge/${props.parent.BadgeCode}`;
const qrCanvas = ref(null);

const draw = () => {
  if (!qrCanvas.value) return;
  QRCode.toCanvas(qrCanvas.value, badgeUrl, {
    width: 220,
    margin: 1,
    color: { dark: "#1b2436", light: "#ffffff" },
  });
};

onMounted(draw);
watch(() => props.parent?.BadgeCode, draw);
</script>

<style scoped>
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
.badge-type-row {
  margin-top: 0.5rem;
}
.badge-type-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  padding: 0.2rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.badge-type-chip.guest {
  background: rgba(185, 138, 30, 0.4);
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
  display: block;
}
.badge-url {
  margin-top: 0.6rem;
  font-size: 0.7rem;
  opacity: 0.75;
  letter-spacing: 0.02em;
  word-break: break-all;
}
</style>
