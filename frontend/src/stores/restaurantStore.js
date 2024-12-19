import { defineStore } from "pinia";
import axios from "@/services/axios";

export const useRestaurantStore = defineStore("restaurant", {
  state: () => ({
    restaurantData: null, // Holds restaurant details
    currentSlug: null, // Tracks current slug
  }),

  actions: {
    // Check if data is already cached
    isDataCached(slug) {
      return this.currentSlug === slug && this.restaurantData !== null;
    },

    // Fetch restaurant data if not cached
    async fetchRestaurantData(slug) {
      if (this.isDataCached(slug)) {
        console.log("Data already cached, skipping fetch.");
        return this.restaurantData; // Return cached data
      }

      try {
        const response = await axios.get(`/restaurants/${slug}`);
        this.restaurantData = response.data.data; // Store fetched data
        this.currentSlug = slug; // Update current slug
        return response.data.data; // Return data
      } catch (error) {
        console.error(
          "Failed to fetch restaurant data:",
          error.response.data.message
        );
        throw new Error("Data fetch failed");
      }
    },
  },
});

// import { defineStore } from "pinia";
// import axios from "@/services/axios";

// export const useRestaurantStore = defineStore("restaurant", {
//   state: () => ({
//     pageData: null,
//     menuData: null,
//     currentSlug: null,
//   }),

//   actions: {
//     async fetchPage(slug, pageName) {
//       try {
//         const response = await axios.get(`/pages/${slug}/${pageName}`);
//         this.pageData = response.data.data;
//         this.currentSlug = slug;
//       } catch (error) {
//         console.error("Failed to fetch page data:", error);
//       }
//     },

//     async fetchMenu(slug) {
//       try {
//         const response = await axios.get(`/pages/${slug}/menu`);
//         this.menuData = response.data.data;
//         this.currentSlug = slug;
//       } catch (error) {
//         console.error("Failed to fetch menu:", error);
//       }
//     },
//   },
// });
