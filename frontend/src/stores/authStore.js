import { defineStore } from "pinia";
import {
  isAuthenticated,
  isOwner,
  hasActiveSubscription,
} from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null, // Holds authenticated user data
    isAuthenticated: false, // Boolean to track auth status
    isOwner: false, // Tracks ownership of the current slug
    hasSubscription: false, // Tracks subscription status
  }),

  actions: {
    async fetchAuthStatus() {
      try {
        const user = await isAuthenticated(); // Call the service function
        if (user) {
          this.user = user; // Set user data
          this.isAuthenticated = true; // Update auth status
        } else {
          this.resetAuth(); // Reset if not authenticated
        }
      } catch (error) {
        console.error("Auth fetch failed:", error);
        this.resetAuth(); // Reset on failure
      }
    },

    async checkOwnership(slug) {
      if (!this.isAuthenticated) {
        console.warn("User not authenticated. Cannot check ownership.");
        return false;
      }
      try {
        this.isOwner = await isOwner(slug);
        return this.isOwner;
      } catch (error) {
        console.error("Ownership check failed:", error);
        this.isOwner = false;
        return false;
      }
    },
    async refreshSubscriptionStatus() {
      try {
        this.hasSubscription = await hasActiveSubscription();
      } catch (error) {
        console.error("Failed to refresh subscription status:", error);
        this.hasSubscription = false;
      }
    },
    async checkSubscription() {
      if (!this.isAuthenticated) {
        console.warn("User not authenticated. Cannot check subscription.");
        return false;
      }
      try {
        this.hasSubscription = await hasActiveSubscription();
        return this.hasSubscription;
      } catch (error) {
        console.error("Subscription check failed:", error);
        this.hasSubscription = false;
        return false;
      }
    },

    resetAuth() {
      this.user = null;
      this.isAuthenticated = false;
      this.isOwner = false;
      this.hasSubscription = false;
    },
  },
});
