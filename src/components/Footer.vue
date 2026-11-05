<template>
  <footer>
    <i class="fa-light fa-copyright"></i> 2026 Mater Dei School | All Rights
    Reserved
    <span class="version">v{{ version }}</span>
  </footer>
</template>

<script setup>
import { version } from "../version.js";
</script>

<style scoped>
footer {
  width: 100%;
  position: fixed;
  bottom: 0;
  color: var(--md-gray-dark);
  text-align: center;
  padding-bottom: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75em;
}
.version {
  font-size: 0.85em;
  color: var(--md-gray);
  background: var(--md-blue-darker);
  padding: 0.1em 0.5em;
  border-radius: 0.4em;
  border: 1px solid var(--md-gray-dark);
}
</style>
