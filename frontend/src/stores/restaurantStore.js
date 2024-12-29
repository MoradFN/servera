import { defineStore } from "pinia";
import axios from "@/services/axios";
import { createPage } from "@/services/pageServices";

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
            const pageData = result.value.data.data;

            if (pageName === "menu") {
              // Check if menu data has meaningful content
              const hasMenuContent =
                (pageData.sections && pageData.sections.length > 0) ||
                (pageData.categories && pageData.categories.length > 0) ||
                (pageData.items && pageData.items.length > 0);

              if (hasMenuContent) {
                this.restaurantData[pageName] = {
                  sections: pageData.sections || [],
                  categories: pageData.categories || [],
                  items:
                    pageData.items?.map((item) => ({
                      ...item,
                      ingredients: item.ingredients || [], // Handle ingredients
                    })) || [],
                };
              } else {
                console.warn(
                  `⚠️ Page '${pageName}' is empty and will not be added.`
                );
              }
            } else {
              // Handle non-menu pages
              this.restaurantData[pageName] = pageData;
            }

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

    async createPage(slug, pageData) {
      try {
        const response = await createPage(slug, pageData);
        if (response.success) {
          this.restaurantData[pageData.name] = { sections: pageData.sections };
        }
        return response;
      } catch (error) {
        console.error("Failed to create page:", error.message);
        throw error;
      }
    },

    // Reset data (if needed)
    resetStore() {
      this.restaurantData = {};
      this.currentSlug = null;
    },
  },
});
