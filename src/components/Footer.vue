<template>
  <footer>
    <div class="container footer-inner">
      <span class="copy">
        <i class="fa-light fa-copyright"></i> 2026 Mater Dei School |
        All Rights Reserved
      </span>
      <span class="version">v{{ version }}</span>
    </div>
  </footer>
</template>

<script setup>
import { version } from "../version.js";
</script>

<style scoped>
footer {
  border-top: 1px solid var(--md-border);
  background: var(--md-surface);
  padding: 1.1rem 0;
  margin-top: 2rem;
}
.footer-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-bottom: 1.1rem;
}
.copy {
  color: var(--md-text-muted);
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.version {
  font-size: 0.85rem;
  color: var(--md-text-soft);
  background: var(--md-surface-2);
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--md-border);
}
</style>
