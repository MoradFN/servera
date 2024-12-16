import jwtDecode from "jwt-decode";
import { useCookies } from "@vueuse/integrations/useCookies";

export const requireAuth = (to, from, next) => {
  const cookies = useCookies();
  const jwtToken = cookies.get("authToken");

  if (!jwtToken) {
    next("/login");
  } else {
    try {
      const decodedToken = jwtDecode(jwtToken);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp && decodedToken.exp < currentTime) {
        cookies.remove("authToken"); // Remove expired token
        next("/login");
      } else {
        next(); // Proceed if token is valid
      }
    } catch (err) {
      console.error("Token decode error:", err);
      next("/login");
    }
  }
};

// Subscription Guard: Checks if user has an active subscription
export const requireSubscription = async (to, from, next) => {
  const cookies = useCookies();
  const jwtToken = cookies.get("jwt");

  if (!jwtToken) {
    next("/login"); // No token, not logged in
    return;
  }

  try {
    const response = await fetch("/api/subscriptions/status", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    const data = await response.json();

    if (data?.status === "active") {
      next(); // Proceed if subscription is active
    } else {
      next("/get-started"); // Redirect if inactive
    }
  } catch (error) {
    console.error("Subscription check failed:", error);
    next("/error"); // Redirect on API failure
  }
};

// Owner Guard: Checks if user owns the restaurant
export const requireOwner = async (to, from, next) => {
  const cookies = useCookies();
  const jwtToken = cookies.get("jwt");

  if (!jwtToken) {
    next("/login");
    return;
  }

  const restaurantSlug = to.params.slug;

  try {
    const response = await fetch(
      `/api/restaurants/verify-ownership/${restaurantSlug}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    const data = await response.json();

    if (data?.isOwner) {
      next(); // Allow access if the user is the owner
    } else {
      next("/unauthorized"); // Redirect if not the owner
    }
  } catch (error) {
    console.error("Ownership verification failed:", error);
    next("/error");
  }
};
