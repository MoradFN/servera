import { defineStore } from "pinia";
import axios from "@/services/axios";

export const useRestaurantStore = defineStore("restaurant", {
  state: () => ({
    restaurantData: {}, // Holds data for all pages
    currentSlug: null, // Tracks current restaurant slug
  }),

  actions: {
    // Check if data is already cached
    isDataCached(slug) {
      return (
        this.currentSlug === slug && Object.keys(this.restaurantData).length > 0
      );
    },

    // Fetch all restaurant pages (home, about, menu)
    async fetchRestaurantData(slug) {
      if (this.isDataCached(slug)) {
        console.log(`✅ Data already cached for ${slug}. Skipping fetch.`);
        return this.restaurantData; // Return cached data
      }

      try {
        console.log(`🔄 Fetching available pages for ${slug}...`);

        // Define pages to fetch
        const pages = ["home", "about", "menu"];

        // Use Promise.allSettled to handle partial success
        const results = await Promise.allSettled(
          pages.map((page) => axios.get(`/pages/${slug}/${page}`))
        );

        // Populate restaurantData only with successful pages
        results.forEach((result, index) => {
          if (result.status === "fulfilled" && result.value.data.data) {
            const pageName = pages[index];
            this.restaurantData[pageName] = result.value.data.data;
            console.log(`✅ Page '${pageName}' loaded successfully.`);
          } else {
            console.warn(
              `⚠️ Page '${pages[index]}' not found for restaurant '${slug}'.`
            );
          }
        });

        this.currentSlug = slug;

        // Check if at least one page is loaded
        if (Object.keys(this.restaurantData).length === 0) {
          throw new Error("No pages found for this restaurant.");
        }

        console.log("✅ Fetch complete:", this.restaurantData);
        return this.restaurantData; // Return available data
      } catch (error) {
        console.error("❌ Fetch failed:", error.message);

        // Reset state and rethrow error
        this.restaurantData = {};
        this.currentSlug = null;
        throw new Error("Failed to fetch restaurant data");
      }
    },

    // Reset data (if needed)
    resetStore() {
      this.restaurantData = {};
      this.currentSlug = null;
    },
  },
});
