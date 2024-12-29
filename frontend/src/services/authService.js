import axios from "./axios";

// Check if the user is authenticated
export async function isAuthenticated() {
  try {
    const response = await axios.get("/auth/is-authenticated");
    return response.data.success ? response.data.user : null;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
}

// Check if the user is the owner of a specific restaurant
export async function isOwner(slug) {
  try {
    const response = await axios.get(`/auth/${slug}/is-owner`);
    return response.data.success ? response.data.isOwner : false;
  } catch (error) {
    console.error("Ownership check failed:", error);
    return false;
  }
}

// Check if the user has an active subscription
export async function hasActiveSubscription() {
  try {
    const response = await axios.get("/auth/subscription-status");
    return response.data.success ? response.data.hasActiveSubscription : false;
  } catch (error) {
    console.error("Subscription check failed:", error);
    return false;
  }
}
