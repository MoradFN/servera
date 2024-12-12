import { createRouter, createWebHistory } from "vue-router";

// Public Pages
import AppHomeView from "@/views/AppHomeView.vue";
import AppAboutView from "@/views/AppAboutView.vue";
import GetStartedView from "@/views/GetStartedView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import SubscribeView from "@/views/SubscribeView.vue";

// Restaurant Pages
import RestaurantLayout from "@/layouts/RestaurantLayout.vue";
import RestaurantHome from "@/views/restaurant/RestaurantHome.vue";
import RestaurantAbout from "@/views/restaurant/RestaurantAbout.vue";
import RestaurantMenu from "@/views/restaurant/RestaurantMenu.vue";
import DisplayRestaurantsView from "@/views/DisplayRestaurantsView.vue";

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
  { path: "/", name: "Home", component: AppHomeView },
  { path: "/about", name: "About", component: AppAboutView },
  { path: "/get-started", name: "GetStarted", component: GetStartedView },
  { path: "/login", name: "Login", component: LoginView },
  { path: "/register", name: "Register", component: RegisterView },
  {
    path: "/restaurants",
    name: "DisplayRestaurants",
    component: DisplayRestaurantsView,
  },
  { path: "/subscribe", name: "Subscribe", component: SubscribeView },
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
