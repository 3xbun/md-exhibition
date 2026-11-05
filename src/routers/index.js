import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Location from "../views/Location.vue";
import Map from "../views/Map.vue";
import Search from "../views/Search.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/location/:name", name: "location", component: Location },
  { path: "/map", name: "map", component: Map },
  { path: "/search", name: "search", component: Search },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
