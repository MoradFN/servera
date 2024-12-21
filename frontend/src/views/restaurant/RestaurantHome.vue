<template>
  <div>
    <!-- Title Section -->
    <h1 v-if="titleSection">{{ titleSection.content }}</h1>
    <h1 v-else>Welcome!</h1>

    <!-- Render all other sections dynamically -->
    <div v-for="section in otherSections" :key="section.section_order">
      <p v-if="section.section_type === 'text'">{{ section.content }}</p>
      <img v-if="section.section_type === 'image'" :src="section.content" />
      <!-- Add more types here if needed -->
    </div>
  </div>
</template>

<script>
import { useRestaurantStore } from "@/stores/restaurantStore";
import { computed } from "vue";

export default {
  setup() {
    const store = useRestaurantStore();

    // Computed property for the "home" page data
    const homePage = computed(() => store.restaurantData?.home || []);

    // Extract title section
    const titleSection = computed(() =>
      homePage.value.find((section) => section.section_type === "title")
    );

    // Extract all other sections (excluding the title)
    const otherSections = computed(() =>
      homePage.value.filter((section) => section.section_type !== "title")
    );

    return {
      homePage,
      titleSection,
      otherSections,
    };
  },
};
</script>
