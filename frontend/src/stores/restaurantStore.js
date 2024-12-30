import { defineStore } from "pinia";
import axios from "@/services/axios";
import { createPage } from "@/services/pageServices";

export const useRestaurantStore = defineStore("restaurant", {
  state: () => ({
    restaurantData: {}, // Holds actual data per page if found
    pageStatus: {}, // Tracks 'found' or 'missing' for each page
    currentSlug: null, // Current restaurant slug
  }),

  actions: {
    isDataCached(slug) {
      return (
        this.currentSlug === slug && Object.keys(this.restaurantData).length > 0
      );
    },

    async fetchRestaurantData(slug) {
      // If already cached, skip
      if (this.isDataCached(slug)) {
        console.log(`✅ Data already cached for ${slug}. Skipping fetch.`);
        return this.restaurantData;
      }

      console.log(`🔄 Fetching available pages for ${slug}...`);

      // Optionally, validate that the restaurant slug itself is valid
      // before fetching pages. Example:
      // const { data } = await axios.get(`/restaurants/${slug}/exists`);
      // if (!data.success) {
      //   throw new Error(`Restaurant slug '${slug}' does not exist.`);
      // }

      // Define pages to fetch
      const pages = ["home", "about", "menu"];
      // Initialize pageStatus so we know which pages are missing vs. found
      this.pageStatus = pages.reduce((acc, p) => {
        acc[p] = "missing";
        return acc;
      }, {});

      // Use Promise.allSettled to handle partial success
      const results = await Promise.allSettled(
        pages.map((page) => axios.get(`/pages/${slug}/${page}`))
      );

      results.forEach((result, index) => {
        const pageName = pages[index];

        if (result.status === "fulfilled" && result.value.data.data) {
          const pageData = result.value.data.data;

          // If it's the 'menu' page, check for meaningful content
          if (pageName === "menu") {
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
                    ingredients: item.ingredients || [],
                  })) || [],
              };
              this.pageStatus[pageName] = "found";
              console.log(`✅ Page '${pageName}' loaded successfully.`);
            } else {
              console.warn(`⚠️ Page '${pageName}' is empty and not included.`);
            }
          } else {
            // Non-menu pages
            this.restaurantData[pageName] = pageData;
            this.pageStatus[pageName] = "found";
            console.log(`✅ Page '${pageName}' loaded successfully.`);
          }
        } else {
          // Page not found
          this.restaurantData[pageName] = null;
          this.pageStatus[pageName] = "missing";
          console.warn(
            `⚠️ Page '${pageName}' not found or empty for restaurant '${slug}'.`
          );
        }
      });

      this.currentSlug = slug;

      // If absolutely no pages found, consider whether to throw or not
      const loadedPages = Object.values(this.pageStatus).filter(
        (status) => status === "found"
      );
      if (loadedPages.length === 0) {
        // If you'd prefer to allow an empty restaurant, just log a warning
        console.warn(
          `⚠️ No pages found for slug '${slug}'. Not throwing an error.`
        );
      }

      console.log("✅ Fetch complete:", {
        restaurantData: this.restaurantData,
        pageStatus: this.pageStatus,
      });
      return this.restaurantData;
    },

    // Create a new page
    async createPage(slug, pageData) {
      try {
        const response = await createPage(slug, pageData);
        if (response.success) {
          // Update store with newly created page
          this.restaurantData[pageData.name] = { sections: pageData.sections };
          this.pageStatus[pageData.name] = "found";
        }
        return response;
      } catch (error) {
        console.error("Failed to create page:", error.message);
        throw error;
      }
    },

    resetStore() {
      this.restaurantData = {};
      this.pageStatus = {};
      this.currentSlug = null;
    },
  },
});
