import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Location from "../views/Location.vue";
import Map from "../views/Map.vue";
import Search from "../views/Search.vue";
import RegisterParent from "../views/RegisterParent.vue";
import StaffScan from "../views/StaffScan.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/location/:name", name: "location", component: Location },
  { path: "/map", name: "map", component: Map },
  { path: "/search", name: "search", component: Search },
  { path: "/register", name: "register", component: RegisterParent },
  { path: "/staff", name: "staff", component: StaffScan },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
