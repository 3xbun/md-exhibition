<template>
  <div class="container">
    <!-- Shared 6-digit PIN gate (same one as /admin). The scanner and its
         confirmation modal only render after the gate passes, so nobody
         can scan / check in without the PIN. -->
    <AdminPinGate>
      <div class="page-header">
        <button class="back-btn" @click="router.go(-1)">
          <i class="fa-duotone fa-solid fa-angle-left"></i>
        </button>
        <i class="fa-duotone fa-solid fa-qrcode title-icon"></i>
        <h1>{{ th.scan_title }}</h1>
      </div>

      <!-- Camera: runs indefinitely while the scan session is open -->
      <div class="scan-card">
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

      <!-- Confirmation modal: pops over the camera; camera keeps running.
           Scanning ONLY looks the badge up — the check-in is written when
           staff tap Confirm. Confirm (or backdrop tap) returns straight to
           scanning the next badge. -->
      <div class="modal-backdrop" v-if="result" @click.self="dismiss">
        <div class="result-card" role="dialog" aria-modal="true">
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

          <!-- Pending: scanned, waiting for staff to tap Confirm -->
          <div v-if="result.ok && result.pending" class="pending-status">
            <i class="fa-duotone fa-solid fa-hourglass-half spin"></i>
            <span>{{ th.checkin_pending }}</span>
          </div>
          <!-- Writing: Confirm tapped, stamp in flight -->
          <div v-else-if="result.ok && result.saving" class="pending-status">
            <i class="fa-duotone fa-solid fa-circle-notch spin"></i>
            <span>{{ th.checkin_pending }}</span>
          </div>
          <!-- Confirmed: stamped by this scan (first time) or kept from before -->
          <div v-else-if="result.ok && result.checkedInAt" class="checkin-status">
            <i class="fa-duotone fa-solid fa-door-open"></i>
            <span>{{ th.checked_in_title }}</span>
            <span class="checkin-time">{{ formatTime(result.checkedInAt) }}</span>
          </div>
          <p v-if="result.ok && !result.first" class="checkin-again">{{ th.already_checked }} — {{ formatTime(result.checkedInAt) }}</p>
          <p v-if="result.ok && result.checkinError" class="error">{{ th.checkin_failed }}</p>

          <!-- Only actionable while awaiting staff confirmation.
               (Unknown badge: no button — tap the backdrop to close.) -->
          <button
            v-if="result.ok && result.pending"
            class="btn"
            :disabled="result.saving"
            @click="confirmResult"
          >
            <i v-if="result.saving" class="fa-duotone fa-solid fa-circle-notch spin"></i>
            <i v-else class="fa-duotone fa-solid fa-check"></i>
            <span>{{ th.confirm_btn }}</span>
          </button>
        </div>
      </div>
    </AdminPinGate>
  </div>
</template>

<script setup>
import { Html5Qrcode } from "html5-qrcode";
import { ref, onUnmounted } from "vue";
import dayjs from "dayjs";
import router from "../routers";
import { th } from "../copy/th.js";
import AdminPinGate from "../components/AdminPinGate.vue";
import {
  findParentByBadgeCode,
  getChildren,
  checkInParent,
} from "../api/parents.js";

const scanning = ref(false);
const error = ref("");
const result = ref(null);
let scanner = null;
let lastCode = "";
let processing = false;
let returnTimer = null;

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

// Scan = LOOKUP ONLY. Nothing is written until staff tap Confirm.
const handleScan = async (raw) => {
  if (processing) return; // one badge at a time; camera keeps decoding meanwhile
  const cur = result.value;
  // A pending confirm is live — let staff act on it first; ignore this flash.
  if (cur && cur.pending) return;
  // A "checked in" flash is showing — don't clobber it; just extend its window.
  if (cur && cur.ok && !cur.pending) {
    clearTimeout(returnTimer);
    returnTimer = setTimeout(returnToScan, 1500);
    return;
  }
  processing = true;
  try {
    // QR may hold the badge URL (https://.../badge/PA-XXXXXX) or a bare code
    let code = String(raw).trim();
    const m = code.match(/badge\/([A-Za-z0-9-]+)/);
    if (m) code = m[1];
    code = code.replace(/^https?:\/\/[^\s]*?\/badge\//, "").split("?")[0];
    const rec = await findParentByBadgeCode(code);
    if (!rec?.fields) {
      result.value = { ok: false };
    } else {
      const kids = await getChildren(rec.id);
      result.value = {
        ok: true,
        recordId: rec.id,
        parent: rec.fields,
        children: kids,
        pending: true, // waiting for staff to tap Confirm
        saving: false,
        checkedInAt: rec.fields.CheckedInAt ?? null,
        first: !rec.fields.CheckedInAt,
      };
    }
  } catch (e) {
    console.error(e);
    result.value = { ok: false };
  } finally {
    // Camera keeps running — the modal is an overlay, scanning never stops.
    processing = false;
  }
};

const formatTime = (iso) =>
  iso ? dayjs(iso).format("DD/MM/YYYY HH:mm") : "";

// Close the modal and go straight back to scanning. Guarded so a fresh
// scan that has taken over the modal is not clobbered by an old timer.
const returnToScan = () => {
  if (result.value?.pending) return; // a pending confirm is live — let staff act on it
  result.value = null;
  lastCode = "";
};

// Staff tapped Confirm: WRITE the check-in (this is the only place the
// database is touched), show the stamped result, then auto-return.
const confirmResult = async () => {
  const r = result.value;
  if (!r || !r.ok || !r.pending || r.saving) return;
  r.saving = true;
  try {
    const ci = await checkInParent(r.recordId);
    r.checkedInAt = ci.checkedInAt;
    r.first = ci.first;
    r.checkinError = false;
    r.pending = false;
    // Brief "checked in" flash, then straight back to scanning.
    clearTimeout(returnTimer);
    returnTimer = setTimeout(returnToScan, 1500);
  } catch (e) {
    console.error(e);
    r.checkinError = true;
    // Keep the modal open so staff can see the error and retry.
  } finally {
    r.saving = false;
  }
};

// Backdrop tap: close the modal WITHOUT checking in (cancel / skip).
const dismiss = () => {
  clearTimeout(returnTimer);
  result.value = null;
  lastCode = "";
};

onUnmounted(() => {
  clearTimeout(returnTimer);
  stopScan();
});
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
.btn:disabled {
  opacity: 0.6;
  cursor: wait;
}
.btn.alt {
  background: var(--md-surface-2);
  color: var(--md-text);
}
.error {
  color: #c0392b;
  font-size: 0.9rem;
}

/* Confirmation modal over the live camera */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}
.modal-backdrop .result-card {
  box-shadow: var(--md-shadow-lg);
  margin: 0;
  width: 100%;
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
.pending-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--md-accent-soft);
  color: var(--md-accent);
  border-radius: 999px;
  padding: 0.35rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
}
.checkin-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(47, 158, 99, 0.12);
  border: 1px solid rgba(47, 158, 99, 0.45);
  color: #247a4b;
  border-radius: 999px;
  padding: 0.35rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
}
.checkin-time {
  color: var(--md-text-soft);
  font-weight: 500;
}
.checkin-again {
  color: var(--md-text-soft);
  font-size: 0.9rem;
  margin: 0;
}
.spin {
  animation: md-spin 1s linear infinite;
}
@keyframes md-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
