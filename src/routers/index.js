import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Location from "../views/Location.vue";
import Map from "../views/Map.vue";
import Search from "../views/Search.vue";
import RegisterParent from "../views/RegisterParent.vue";
import StaffScan from "../views/StaffScan.vue";
import Badge from "../views/Badge.vue";
import Admin from "../views/Admin.vue";
import AdminTraffic from "../views/AdminTraffic.vue";
import Stage from "../views/Stage.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/location/:name", name: "location", component: Location },
  { path: "/map", name: "map", component: Map },
  { path: "/search", name: "search", component: Search },
  { path: "/register", name: "register", component: RegisterParent },
  { path: "/badge", name: "badges", component: Badge },
  { path: "/badge/:code", name: "badge", component: Badge },
  { path: "/admin", name: "admin", component: Admin },
  { path: "/admin/scan", name: "staff-scan", component: StaffScan },
  { path: "/admin/traffic", name: "admin-traffic", component: AdminTraffic },
  { path: "/stage/:name", name: "stage", component: Stage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
