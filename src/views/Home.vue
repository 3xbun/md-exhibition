<template>
  <div class="container">
    <div class="logo">
      <img src="/imgs/logo-alternate.png" alt="" />
    </div>
    <h1>MD Exhibition</h1>
    <h2>
      งานนิทรรศการประจำปี <br />
      โรงเรียนมาแตร์เดอีวิทยาลัย
    </h2>
    <nav>
      <ul>
        <router-link to="map">
          <li class="nav-item">
            <i class="fa-duotone fa-solid fa-map-location-dot"></i> แผนที่
          </li>
        </router-link>
        <router-link to="/timetable">
          <li class="nav-item">
            <i class="fa-duotone fa-solid fa-list-ol"></i> กำหนดการ
          </li>
        </router-link>
      </ul>
      <router-link to="search">
        <p class="nav-item">
          <i class="fa-duotone fa-solid fa-address-card"></i>
          ค้นหาด้วยเลขประจำตัวนักเรียน
        </p>
      </router-link>
    </nav>
    <div class="contents">
      <img
        src="https://www.effectivesoft.com/wp/wp-content/uploads/2022/12/%D1%86%D0%B8%D1%82%D0%B0%D1%82%D0%B0-%D0%B2-%D1%81%D0%B0%D0%B8%CC%86%D1%82.jpg"
        alt=""
      />
      <img
        src="https://www.effectivesoft.com/wp/wp-content/uploads/2022/12/%D1%86%D0%B8%D1%82%D0%B0%D1%82%D0%B0-%D0%B2-%D1%81%D0%B0%D0%B8%CC%86%D1%82.jpg"
        alt=""
      />
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.logo {
  margin: auto;
  width: 25%;
  border-radius: 50%;
}
h1,
h2 {
  text-align: center;
}

h2 {
  color: var(--md-gray);
}

nav {
  margin: 2em 0;
}

ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
  margin-bottom: 1em;
}

a {
  width: calc(50% - 0.5em);
}

.nav-item {
  padding: 0.5em 0;
  border-radius: 0.5em;
  text-align: center;
  color: var(--md-blue-darker);
  background-color: var(--md-gray);
  cursor: pointer;
}

p.nav-item {
  width: 100%;
  margin: auto;
}

.contents {
  margin: 1em 0;
}
</style>
