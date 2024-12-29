<template>
  <div>
    <h1>Admin Dashboard</h1>
    <div v-if="loading">Loading data...</div>
    <div v-else-if="!hasPages">
      <p>No pages available. You can create your first page below.</p>
    </div>
    <div v-else>
      <p>Existing Pages:</p>
      <ul>
        <li v-for="(page, index) in pages" :key="index">{{ page }}</li>
      </ul>
    </div>
    <button @click="createPage">Create Page</button>
  </div>
</template>

<script>
import { useRestaurantStore } from "@/stores/restaurantStore";
import { computed, ref, onMounted } from "vue";

export default {
  setup() {
    const restaurantStore = useRestaurantStore();
    const loading = ref(true);

    // Existing pages
    const pages = computed(() =>
      Object.keys(restaurantStore.restaurantData).map(
        (key) => `${key.charAt(0).toUpperCase()}${key.slice(1)}`
      )
    );

    // Check if any pages exist
    const hasPages = computed(() => pages.value.length > 0);

    const createPage = async () => {
      try {
        console.log("Creating a new page...");
        // Add page creation logic here
      } catch (error) {
        console.error("Failed to create page:", error.message);
      }
    };

    onMounted(() => {
      loading.value = false; // Simulate loading completion
    });

    return { pages, hasPages, createPage, loading };
  },
};
</script>
