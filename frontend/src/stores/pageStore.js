import axios from "@/services/axios";
import { defineStore } from "pinia";

export const usePageStore = defineStore("page", {
  state: () => ({
    sections: [],
    pageName: null,
    slug: null,
  }),

  actions: {
    // Fetch sections for a specific page
    async fetchSections(slug, pageName) {
      try {
        const response = await axios.get(`/pages/${slug}/${pageName}/sections`);
        if (response.data.success) {
          this.sections = response.data.data;
          this.pageName = pageName;
          this.slug = slug;
        } else {
          console.warn("Failed to fetch sections:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching sections:", error.message);
      }
    },

    // Update sections for a specific page
    async updateSections(slug, pageName, sections) {
      try {
        const response = await axios.put(
          `/pages/${slug}/${pageName}/sections`,
          {
            sections,
          }
        );
        if (response.data.success) {
          this.sections = sections; // Update store with the new sections
          return true;
        } else {
          console.warn("Failed to update sections:", response.data.message);
          return false;
        }
      } catch (error) {
        console.error("Error updating sections:", error.message);
        return false;
      }
    },

    // Reset the page store
    resetPageStore() {
      this.sections = [];
      this.pageName = null;
      this.slug = null;
    },
  },
});
