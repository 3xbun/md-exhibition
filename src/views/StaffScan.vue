<template>
  <div class="container">
    <div class="page-header">
      <button class="back-btn" @click="router.go(-1)">
        <i class="fa-duotone fa-solid fa-angle-left"></i>
      </button>
      <i class="fa-duotone fa-solid fa-qrcode title-icon"></i>
      <h1>{{ th.scan_title }}</h1>
    </div>

    <!-- Camera -->
    <div class="scan-card" v-if="!result">
      <p class="scan-sub">{{ th.scan_sub }}</p>
      <div id="qr-reader" class="reader"></div>
      <div class="scan-actions">
        <button v-if="!scanning" class="btn" @click="startScan">
          <i class="fa-duotone fa-solid fa-camera"></i>
          <span>{{ th.scan_btn }}</span>
        </button>
        <button v-else class="btn alt" @click="stopScan">
          <i class="fa-duotone fa-solid fa-stop"></i>
          <span>{{ th.stop_btn }}</span>
        </button>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>

    <!-- Result -->
    <div class="result-card" v-else>
      <div class="result-icon" :class="result.ok ? 'ok' : 'no'">
        <i :class="result.ok ? 'fa-duotone fa-solid fa-circle-check' : 'fa-duotone fa-solid fa-circle-xmark'"></i>
      </div>
      <h2 class="result-title">
        {{ result.ok ? result.parent.FirstName + " " + result.parent.LastName : th.not_found }}
      </h2>
      <p v-if="result.ok" class="result-type" :class="result.parent.Type">
        <i :class="result.parent.Type === 'guest' ? 'fa-duotone fa-solid fa-user-group' : 'fa-duotone fa-solid fa-user-shield'"></i>
        {{ result.parent.Type === 'guest' ? th.guest_label : th.parent_label }}
      </p>
      <p v-if="result.ok" class="result-code">{{ result.parent.BadgeCode }}</p>
      <p v-if="result.ok && result.children.length" class="result-kids">
        {{ th.child_label }}:
        <span v-for="kid in result.children" :key="kid.id" class="chip">{{ kid.fields?.StudentID }}</span>
      </p>
      <button class="btn" @click="reset">
        <i class="fa-duotone fa-solid fa-rotate-left"></i>
        <span>{{ th.scan_btn }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { Html5Qrcode } from "html5-qrcode";
import { ref, onUnmounted } from "vue";
import router from "../routers";
import { th } from "../copy/th.js";
import { findParentByBadgeCode, getChildren } from "../api/parents.js";

const scanning = ref(false);
const error = ref("");
const result = ref(null);
let scanner = null;
let lastCode = "";

const startScan = () => {
  error.value = "";
  scanner = new Html5Qrcode("qr-reader");
  scanner
    .start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 260, height: 260 } },
      (decoded) => {
        if (decoded === lastCode) return;
        lastCode = decoded;
        handleScan(decoded);
      },
      () => {}
    )
    .then(() => {
      scanning.value = true;
    })
    .catch((e) => {
      console.error(e);
      error.value = "Camera error";
    });
};

const stopScan = () => {
  if (scanner) {
    scanner.stop().then(() => scanner.clear()).catch(() => {});
    scanner = null;
  }
  scanning.value = false;
};

const handleScan = async (raw) => {
  // QR encodes the badge code directly (MD-XXXXXX)
  const code = String(raw).trim();
  const rec = await findParentByBadgeCode(code);
  if (!rec?.fields) {
    result.value = { ok: false };
  } else {
    result.value = { ok: true, parent: rec.fields, children: await getChildren(rec.id) };
  }
  stopScan();
};

const reset = () => {
  result.value = null;
  lastCode = "";
  startScan();
};

onUnmounted(stopScan);
</script>

<style scoped>
.scan-card,
.result-card {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  box-shadow: var(--md-shadow);
  padding: 1.5rem;
  max-width: 520px;
  margin: 0 auto;
}
.scan-sub {
  color: var(--md-text-soft);
  margin-bottom: 1rem;
}
.reader {
  border-radius: 0.8rem;
  overflow: hidden;
  margin-bottom: 1rem;
}
.reader video {
  width: 100%;
  border-radius: 0.8rem;
}
.scan-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 0.8rem 1.6rem;
  border: none;
  border-radius: 999px;
  background: var(--md-accent);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--md-shadow);
}
.btn.alt {
  background: var(--md-surface-2);
  color: var(--md-text);
}
.error {
  color: #c0392b;
  font-size: 0.9rem;
}

.result-card {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.result-icon {
  font-size: 3rem;
}
.result-icon.ok {
  color: #2f9e63;
}
.result-icon.no {
  color: #c0392b;
}
.result-title {
  font-size: 1.5rem;
  font-weight: 700;
}
.result-type {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--md-accent-soft);
  color: var(--md-accent);
  border-radius: 999px;
  padding: 0.2rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
}
.result-type.guest {
  background: #f7efdc;
  color: var(--md-gold);
}
.result-code {
  letter-spacing: 0.12em;
  color: var(--md-text-soft);
  font-weight: 600;
}
.result-kids {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
  color: var(--md-text-soft);
  font-size: 0.95rem;
}
.chip {
  background: var(--md-accent-soft);
  color: var(--md-accent);
  border-radius: 999px;
  padding: 0.15rem 0.7rem;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>
