import { createRouter, createWebHistory } from "vue-router";
// import NotFound from "@/views/NotFound.vue";

// Public Pages
import AppHomeView from "@/views/AppHomeView.vue";
import AppAboutView from "@/views/AppAboutView.vue";
import GetStartedView from "@/views/GetStartedView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import SubscribeView from "@/views/SubscribeView.vue";
import TestView from "@/views/TestView.vue";

// Restaurant Pages
import RestaurantLayout from "@/layouts/RestaurantLayout.vue";
import RestaurantHome from "@/views/restaurant/RestaurantHome.vue";
import RestaurantAbout from "@/views/restaurant/RestaurantAbout.vue";
import RestaurantMenu from "@/views/restaurant/RestaurantMenu.vue";
import DisplayRestaurantsView from "@/views/DisplayRestaurantsView.vue";

// Owner Editable Page
import EditPageWrapper from "@/views/admin/EditPageWrapper.vue";

// auth
// import { isAuthenticated } from "@/services/authService";
import { useRestaurantStore } from "@/stores/restaurantStore"; // If you use a restaurant store
import { useAuthStore } from "@/stores/authStore";

// Auth Guard
// import {
//   requireAuth,
//   requireSubscription,
//   requireOwner,
// } from "../auth/authGuards.js";

// Mock Function to Check Slug Existence
async function checkSlug(to, from, next) {
  const validSlugs = ["italian-palace", "stripe-pizzeria", "test-pizzeria3"]; // Example slugs
  if (validSlugs.includes(to.params.slug)) {
    next(); // Proceed if slug exists
  } else {
    next({ name: "NotFound" }); // Redirect to 404 if slug is invalid
  }
}

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
  {
    path: "/test",
    name: "Test",
    component: TestView, // Reuse the same page
    meta: { requiresAuth: true }, // Route needs auth
  },
  // Restaurant Pages (Public-Facing)
  {
    path: "/:slug([a-z0-9-]+)",
    component: RestaurantLayout, // Shared layout for restaurant pages
    beforeEnter: checkSlug,
    children: [
      { path: "", name: "RestaurantHome", component: RestaurantHome },
      { path: "about", name: "RestaurantAbout", component: RestaurantAbout },
      { path: "menu", name: "RestaurantMenu", component: RestaurantMenu },
      //MTTODO: CHeck admin grejen
      // {
      //   path: "admin",
      //   component: RestaurantAdmin,
      //   meta: { requiresAuth: true },
      // },
    ],
  },

  // Owner-Editable Pages (Protected)
  {
    path: "/:slug/manage/:page",
    name: "EditPage",
    component: EditPageWrapper,
    meta: { requiresAuth: true }, // Route needs auth
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

// Managa hur routes är tillgängliga, vad som ska hända osv.
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const restaurantStore = useRestaurantStore();

  // Check authentication if required
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    await authStore.fetchAuthStatus(); // Fetch auth data only once
    if (!authStore.isAuthenticated) {
      return next("/login"); // Redirect if not authenticated
    }
  }

  // Pre-fetch restaurant data if route has a slug
  if (to.params.slug && !restaurantStore.isDataCached(to.params.slug)) {
    await restaurantStore.fetchRestaurantData(to.params.slug); // Preload restaurant
  }

  next(); // Allow navigation if all checks pass
});

export default router;
