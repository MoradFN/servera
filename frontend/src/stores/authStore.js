import { defineStore } from "pinia";
import { isAuthenticated } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null, // Holds authenticated user data
    isAuthenticated: false, // Boolean to track auth status
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

    resetAuth() {
      this.user = null;
      this.isAuthenticated = false;
    },
  },
});
