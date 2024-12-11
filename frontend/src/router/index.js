import { createRouter, createWebHistory } from "vue-router";

// Public Pages
import PublicHome from "@/views/PublicHome.vue";
import PublicAbout from "@/views/PublicAbout.vue";
import GetStarted from "@/views/GetStarted.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";

// Restaurant Pages
import RestaurantLayout from "@/layouts/RestaurantLayout.vue";
import RestaurantHome from "@/views/restaurant/RestaurantHome.vue";
import RestaurantAbout from "@/views/restaurant/RestaurantAbout.vue";
import RestaurantMenu from "@/views/restaurant/RestaurantMenu.vue";

// Owner Editable Page
import EditPageWrapper from "@/views/admin/EditPageWrapper.vue";

// Auth Guard
import {
  requireAuth,
  requireSubscription,
  requireOwner,
} from "../auth/authGuards.js";

// Define routes
const routes = [
  // Public Pages (App Homepage)
  { path: "/", name: "Home", component: PublicHome },
  { path: "/about", name: "About", component: PublicAbout },
  { path: "/get-started", name: "GetStarted", component: GetStarted },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },

  // Restaurant Pages (Public-Facing)
  {
    path: "/:slug",
    component: RestaurantLayout, // Shared layout for restaurant pages
    children: [
      { path: "", name: "RestaurantHome", component: RestaurantHome },
      { path: "about", name: "RestaurantAbout", component: RestaurantAbout },
      { path: "menu", name: "RestaurantMenu", component: RestaurantMenu },
    ],
  },

  // Owner-Editable Pages (Protected)
  {
    path: "/:slug/manage/:page",
    name: "EditPage",
    component: EditPageWrapper,
    beforeEnter: requireAuth, // Auth Guard for protected pages
  },

  // 404 Not Found
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

// Create and export router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
