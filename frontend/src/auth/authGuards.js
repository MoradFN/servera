// import { useAuthStore } from "@/stores/authStore";
// import { useRestaurantStore } from "@/stores/restaurantStore";

// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();
//   const restaurantStore = useRestaurantStore();

//   // Fetch authentication status if required
//   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
//     await authStore.fetchAuthStatus(); // Check if the user is logged in
//     if (!authStore.isAuthenticated) {
//       return next("/login"); // Redirect to login if not authenticated
//     }
//   }

//   // Pre-fetch restaurant data if needed
//   if (to.params.slug && !restaurantStore.isDataCached(to.params.slug)) {
//     await restaurantStore.fetchRestaurantData(to.params.slug);
//   }

//   next(); // Proceed if all checks pass
// });

// // Subscription Guard: Checks if user has an active subscription
// export const requireSubscription = async (to, from, next) => {
//   const cookies = useCookies();
//   const jwtToken = cookies.get("jwt");

//   if (!jwtToken) {
//     next("/login"); // No token, not logged in
//     return;
//   }

//   try {
//     const response = await fetch("/api/subscriptions/status", {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${jwtToken}`,
//       },
//     });

//     const data = await response.json();

//     if (data?.status === "active") {
//       next(); // Proceed if subscription is active
//     } else {
//       next("/get-started"); // Redirect if inactive
//     }
//   } catch (error) {
//     console.error("Subscription check failed:", error);
//     next("/error"); // Redirect on API failure
//   }
// };

// // Owner Guard: Checks if user owns the restaurant
// export const requireOwner = async (to, from, next) => {
//   const cookies = useCookies();
//   const jwtToken = cookies.get("jwt");

//   if (!jwtToken) {
//     next("/login");
//     return;
//   }

//   const restaurantSlug = to.params.slug;

//   try {
//     const response = await fetch(
//       `/api/restaurants/verify-ownership/${restaurantSlug}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${jwtToken}`,
//         },
//       }
//     );

//     const data = await response.json();

//     if (data?.isOwner) {
//       next(); // Allow access if the user is the owner
//     } else {
//       next("/unauthorized"); // Redirect if not the owner
//     }
//   } catch (error) {
//     console.error("Ownership verification failed:", error);
//     next("/error");
//   }
// };
