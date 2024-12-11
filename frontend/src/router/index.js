import { createRouter, createWebHistory } from "vue-router";

// Public Pages
import AppHome from "@/views/AppHome.vue";
import AppAbout from "@/views/AppAbout.vue";
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
  { path: "/", name: "Home", component: AppHome },
  { path: "/about", name: "About", component: AppAbout },
  { path: "/get-started", name: "GetStarted", component: GetStarted },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  // Temporary Test Route (Directly Access)
  // {
  //   path: "/test-menu",
  //   name: "TestMenu",
  //   component: RestaurantMenu, // Reuse the same page
  // },
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
