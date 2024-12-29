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
import TestRestaurantPage from "@/views/restaurant/TestRestaurantPage.vue";
import AdminDashboard from "@/views/admin/AdminDashboard.vue";

// Auth Guard
// import {
//   requireAuth,
//   requireSubscription,
//   requireOwner,
// } from "../auth/authGuards.js";

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
  {
    path: "/test-restaurant",
    name: "TestRestaurant",
    component: TestRestaurantPage,
  },

  // Restaurant Pages (Public-Facing)
  {
    path: "/:slug",
    component: RestaurantLayout, // Shared layout for restaurant pages
    children: [
      { path: "", name: "RestaurantHome", component: RestaurantHome },
      { path: "about", name: "RestaurantAbout", component: RestaurantAbout },
      { path: "menu", name: "RestaurantMenu", component: RestaurantMenu },
      //MTTODO: CHeck admin grejen
      {
        path: "admin",
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresOwner: true },
      },
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

  try {
    // Check authentication if required
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      await authStore.fetchAuthStatus();
      if (!authStore.isAuthenticated) {
        console.warn("User not authenticated.");
        return next("/login");
      }
    }

    // Pre-fetch restaurant data if the route has a slug
    if (to.params.slug && !restaurantStore.isDataCached(to.params.slug)) {
      try {
        await restaurantStore.fetchRestaurantData(to.params.slug);
      } catch (error) {
        console.warn(
          `Restaurant data for slug '${to.params.slug}' not found. Proceeding without data.`
        );
        // Continue without blocking navigation
      }
    }

    // Check ownership if required
    if (to.meta.requiresOwner) {
      const isOwner = await authStore.checkOwnership(to.params.slug);
      if (!isOwner) {
        console.warn(
          "Access denied: User is not the owner of this restaurant."
        );
        return next("/");
      }
    }

    // Check subscription if required
    if (to.meta.requiresSubscription) {
      const hasSubscription = await authStore.checkSubscription();
      if (!hasSubscription) {
        console.warn("Access denied: No active subscription.");
        return next("/subscribe");
      }
    }

    next(); // Allow navigation if all checks pass
  } catch (error) {
    console.error("Navigation error:", error);
    next("/"); // Redirect to a safe fallback on error
  }
});

export default router;
