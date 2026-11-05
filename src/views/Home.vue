<template>
  <div class="home">
    <section class="hero">
      <div class="hero-inner container">
        <div class="logo">
          <img src="/imgs/logo-alternate.png" alt="" />
        </div>
        <h1 class="hero-title">MD Exhibition</h1>
        <p class="hero-sub">งานนิทรรศการประจำปี <br />โรงเรียนมาแตร์เดอีวิทยาลัย</p>

        <div class="hero-actions">
          <router-link to="/map" class="action-btn">
            <i class="fa-duotone fa-solid fa-map-location-dot"></i>
            <span>แผนที่</span>
          </router-link>
          <router-link to="/search" class="action-btn alt">
            <i class="fa-duotone fa-solid fa-address-card"></i>
            <span>ค้นหานักเรียน</span>
          </router-link>
        </div>
      </div>
    </section>

    <main class="container">
      <section class="locations">
        <h2 class="section-title">สถานที่จัดกิจกรรม</h2>
        <div class="loc-grid">
          <router-link
            v-for="loc in locations"
            :key="loc.name"
            :to="`/location/${encodeURIComponent(loc.name)}`"
            class="loc-card"
          >
            <div class="loc-card-top">
              <span class="loc-icon">
                <i class="fa-duotone fa-solid fa-location-dot"></i>
              </span>
              <span class="loc-arrow">
                <i class="fa-duotone fa-solid fa-chevron-right"></i>
              </span>
            </div>
            <div class="loc-name">{{ loc.name }}</div>
            <div class="loc-count">{{ programCount(loc.name) }} รายการ</div>
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { locations } from "../data/locations.js";

const events = inject("events");

const programCount = (name) =>
  events.value.filter((e) => e.Location === name).length;

</script>

<style scoped>
/* --- Hero --- */
.hero {
  background: linear-gradient(180deg, var(--md-accent) 0%, #1f3f9e 100%);
  color: #fff;
  text-align: center;
}
.hero-inner {
  padding-top: 3rem;
  padding-bottom: 3.5rem;
}
.logo {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #fff;
  padding: 0.4rem;
  margin: 0 auto 1.25rem;
  box-shadow: var(--md-shadow-lg);
}
.logo img {
  border-radius: 50%;
}
.hero-title {
  font-size: clamp(1.9rem, 5vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0.02em;
}
.hero-sub {
  margin-top: 0.6rem;
  font-size: 1.05rem;
  font-weight: 300;
  opacity: 0.92;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  justify-content: center;
  margin-top: 2rem;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: #fff;
  color: var(--md-accent);
  font-weight: 600;
  font-size: 1rem;
  box-shadow: var(--md-shadow);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--md-shadow-lg);
}
.action-btn.alt {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  backdrop-filter: blur(4px);
}

/* --- Hero nav already above; no old-style nav --- */

/* --- Locations --- */
.locations {
  margin-top: 1.5rem;
}
.loc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1rem;
}
.loc-card {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  padding: 1.1rem 1.2rem;
  box-shadow: var(--md-shadow);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}
.loc-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--md-shadow-lg);
  border-color: var(--md-accent);
}
.loc-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.loc-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: var(--md-accent-soft);
  color: var(--md-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
}
.loc-arrow {
  color: var(--md-text-muted);
  font-size: 0.9rem;
}
.loc-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--md-text);
}
.loc-count {
  margin-top: 0.25rem;
  color: var(--md-text-muted);
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .loc-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
