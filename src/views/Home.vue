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
                <i :class="`fa-duotone fa-solid ${loc.icon}`"></i>
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

      <section class="subjects" v-if="subjects.length">
        <h2 class="section-title">{{ th.sub_title }}</h2>
        <p class="sub-sub">{{ th.sub_sub }}</p>
        <div
          class="sub-carousel"
          @touchstart.passive="onTouchStart"
          @touchend.passive="onTouchEnd"
        >
          <button
            v-if="subjects.length > 1"
            class="sub-arrow prev"
            :aria-label="'previous'"
            @click="prev"
          >
            <i class="fa-duotone fa-solid fa-chevron-left"></i>
          </button>
          <div class="sub-viewport">
            <div
              class="sub-track"
              :style="{ transform: `translateX(-${index * 100}%)` }"
            >
              <div v-for="s in subjects" :key="s.id" class="sub-slide">
                <div class="sub-card">
                  <div class="sub-card-head">
                    <span class="sub-icon">
                      <i :class="subjectIcon(s.Subject)"></i>
                    </span>
                    <h3 class="sub-name">{{ s.Subject }}</h3>
                  </div>
                  <p class="sub-desc">{{ s.Description }}</p>
                </div>
              </div>
            </div>
          </div>
          <button
            v-if="subjects.length > 1"
            class="sub-arrow next"
            :aria-label="'next'"
            @click="next"
          >
            <i class="fa-duotone fa-solid fa-chevron-right"></i>
          </button>
        </div>
        <div v-if="subjects.length > 1" class="sub-dots">
          <button
            v-for="(s, i) in subjects"
            :key="s.id"
            class="dot"
            :class="{ active: i === index }"
            :aria-label="String(i + 1)"
            @click="index = i"
          ></button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { inject, ref, onMounted } from "vue";
import { locations } from "../data/locations.js";
import { th } from "../copy/th.js";
import { subjectIcon } from "../data/subjectIcons.js";
import { listSubjects } from "../api/subjects.js";

const events = inject("events");
const subjects = ref([]);
const index = ref(0);

const programCount = (name) =>
  events.value.filter((e) => e.Location === name).length;

// --- Carousel controls (one card per view, wraps at the ends) ---
const next = () => {
  if (subjects.value.length)
    index.value = (index.value + 1) % subjects.value.length;
};
const prev = () => {
  if (subjects.value.length)
    index.value = (index.value - 1 + subjects.value.length) % subjects.value.length;
};
// Swipe (touch): track the horizontal delta and advance past a small threshold.
let touchX = 0;
function onTouchStart(e) {
  touchX = e.touches[0].clientX;
}
function onTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - touchX;
  if (dx < -40) next();
  else if (dx > 40) prev();
}

// Load the per-subject descriptions. A failed fetch just hides the section —
// the home page never blocks on it.
onMounted(async () => {
  try {
    const recs = await listSubjects();
    subjects.value = recs
      .map((r) => ({
        id: r.id,
        Subject: r.fields?.Subject,
        Description: r.fields?.Description,
      }))
      .filter((s) => s.Subject && s.Description);
  } catch {
    subjects.value = [];
  }
});
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
  padding-top: 5%;
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

/* --- Subjects --- */
.subjects {
  margin-top: 2.25rem;
}
.sub-sub {
  color: var(--md-text-soft);
  margin: 0.4rem 0 0 0.1rem;
  font-size: 0.95rem;
}
/* --- Subjects carousel (one card per view) --- */
.sub-carousel {
  position: relative;
  margin-top: 1.25rem;
}
.sub-viewport {
  overflow: hidden;
  border-radius: 1rem;
}
.sub-track {
  display: flex;
  transition: transform 0.35s ease;
}
.sub-slide {
  flex: 0 0 100%;
  min-width: 0;
}
.sub-card {
  background: var(--md-surface);
  border: 1px solid var(--md-border);
  border-radius: 1rem;
  box-shadow: var(--md-shadow);
  padding: 1.5rem 1.6rem;
  display: flex;
  flex-direction: column;
  min-height: 260px;
}
.sub-card-head {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
}
.sub-icon {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.75rem;
  background: var(--md-accent-soft);
  color: var(--md-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}
.sub-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--md-text);
}
.sub-desc {
  margin: 0;
  color: var(--md-text-soft);
  font-size: 0.98rem;
  line-height: 1.65;
  white-space: pre-wrap;
}
.sub-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  border: 1px solid var(--md-border);
  background: var(--md-surface);
  color: var(--md-accent);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--md-shadow);
  transition: background 0.15s ease, color 0.15s ease;
  z-index: 2;
}
.sub-arrow:hover {
  background: var(--md-accent);
  color: #fff;
}
.sub-arrow.prev {
  left: -0.5rem;
}
.sub-arrow.next {
  right: -0.5rem;
}
.sub-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.9rem;
}
.dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  border: none;
  background: var(--md-border);
  cursor: pointer;
  padding: 0;
  transition: background 0.15s ease, transform 0.15s ease;
}
.dot.active {
  background: var(--md-accent);
  transform: scale(1.25);
}

@media (max-width: 600px) {
  .loc-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  .sub-card {
    padding: 1.2rem 1.25rem;
    min-height: 240px;
  }
  .sub-name {
    font-size: 1.1rem;
  }
  .sub-arrow {
    width: 2rem;
    height: 2rem;
    font-size: 0.9rem;
  }
  .sub-arrow.prev {
    left: 0.35rem;
  }
  .sub-arrow.next {
    right: 0.35rem;
  }
}
</style>
