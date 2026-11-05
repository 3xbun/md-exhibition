import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Location from "../views/Location.vue";
import Map from "../views/Map.vue";
import Search from "../views/Search.vue";
import RegisterParent from "../views/RegisterParent.vue";
import StaffScan from "../views/StaffScan.vue";
import Badge from "../views/Badge.vue";
import Admin from "../views/Admin.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/location/:name", name: "location", component: Location },
  { path: "/map", name: "map", component: Map },
  { path: "/search", name: "search", component: Search },
  { path: "/register", name: "register", component: RegisterParent },
  { path: "/staff", name: "staff", component: StaffScan },
  { path: "/badge", name: "badges", component: Badge },
  { path: "/badge/:code", name: "badge", component: Badge },
  { path: "/admin", name: "admin", component: Admin },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
