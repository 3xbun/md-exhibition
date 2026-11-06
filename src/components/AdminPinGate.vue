<template>
  <!-- PIN gate: shared by every /admin* page. The slot only renders once
       the gate has been passed this tab; before that, only the lock form
       is in the DOM (so no protected content/data can leak). -->
  <div v-if="!unlocked" class="lock">
    <i class="fa-duotone fa-solid fa-lock lock-icon"></i>
    <h1 class="lock-title">{{ th.lock_title }}</h1>
    <p class="lock-sub">{{ th.lock_sub }}</p>
    <form class="lock-form" @submit.prevent="submit">
      <input
        v-model="pin"
        type="password"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        class="lock-input"
        :placeholder="th.pin_ph"
        :disabled="busy"
        autofocus
      />
      <button class="btn" type="submit" :disabled="busy || pin.length < 6">
        <i class="fa-duotone fa-solid fa-unlock-keyhole"></i>
        <span>{{ th.unlock_btn }}</span>
      </button>
    </form>
    <p v-if="wrong" class="lock-error">{{ th.pin_wrong }}</p>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref } from "vue";
import { th } from "../copy/th.js";
import { isUnlocked, tryUnlockPin } from "../api/adminAuth.js";

// Emits 'unlocked' when the PIN is accepted in THIS component instance, so a
// parent can fetch its protected data. (The per-tab unlock flag is what lets
// a sibling page skip the form entirely.)
const emit = defineEmits(["unlocked"]);

const pin = ref("");
const wrong = ref(false);
const busy = ref(false);
const unlocked = ref(isUnlocked());

const submit = async () => {
  if (busy.value) return;
  busy.value = true;
  try {
    if (await tryUnlockPin(pin.value)) {
      unlocked.value = true;
      emit("unlocked");
    } else {
      wrong.value = true;
      pin.value = "";
    }
  } finally {
    busy.value = false;
  }
};
</script>

<style scoped>
.lock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  padding: 3.5rem 1rem;
  max-width: 420px;
  margin: 0 auto;
  text-align: center;
}
.lock-icon {
  font-size: 2.6rem;
  color: var(--md-accent);
}
.lock-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}
.lock-sub {
  color: var(--md-text-soft);
  margin: 0;
}
.lock-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}
.lock-input {
  padding: 0.85rem 1rem;
  border: 1px solid var(--md-border);
  border-radius: 999px;
  background: var(--md-surface);
  box-shadow: var(--md-shadow);
  font-size: 1.15rem;
  font-family: inherit;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-align: center;
  color: var(--md-text);
  outline: none;
  min-height: 52px;
}
.lock-input:focus {
  border-color: var(--md-accent);
}
.lock-form .btn {
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
.lock-form .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.lock-error {
  color: #c0392b;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}
</style>
