import { defineStore } from "pinia";
import axios from "@/services/axios";

export const useSectionStore = defineStore("sections", {
  state: () => ({
    sections: [], // Holds sections for a page
    currentPageName: null, // Tracks the page for the sections
  }),

  actions: {
    async fetchSections(slug, pageName) {
      try {
        const response = await axios.get(`/pages/${slug}/${pageName}/sections`);
        if (response.data.success) {
          this.sections = response.data.data.sections;
          this.currentPageName = pageName;
          console.log(`✅ Sections loaded for page '${pageName}'.`);
        }
      } catch (error) {
        console.error(
          `Failed to fetch sections for '${pageName}':`,
          error.message
        );
        throw error;
      }
    },

    async updateSections(slug, pageName, sections) {
      try {
        const response = await axios.put(
          `/pages/${slug}/${pageName}/sections`,
          {
            sections,
          }
        );
        if (response.data.success) {
          this.sections = sections; // Sync the store after a successful update
          console.log(`✅ Sections updated for page '${pageName}'.`);
        }
      } catch (error) {
        console.error(
          `Failed to update sections for '${pageName}':`,
          error.message
        );
        throw error;
      }
    },

    resetSections() {
      this.sections = [];
      this.currentPageName = null;
    },
  },
});
