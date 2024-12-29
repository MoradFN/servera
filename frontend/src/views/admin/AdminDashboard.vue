<template>
  <div>
    <h1>Admin Dashboard</h1>
    <p v-if="isLoading">Loading data...</p>
    <p v-else-if="!hasData">No pages available. Create your first page!</p>
    <ul v-else>
      <li v-for="(page, index) in pages" :key="index">
        {{ page.name }}
      </li>
    </ul>
    <button @click="createPage">Create Page</button>
  </div>
</template>

<script>
import { useRestaurantStore } from "@/stores/restaurantStore";
import { computed, onMounted, ref } from "vue";

export default {
  setup() {
    const restaurantStore = useRestaurantStore();
    const isLoading = ref(true);

    const pages = computed(() => Object.keys(restaurantStore.restaurantData));
    const hasData = computed(() => pages.value.length > 0);

    const createPage = async () => {
      try {
        await restaurantStore.createPage("home", "Home");
      } catch (error) {
        console.error("Failed to create page:", error.message);
      }
    };

    // Ensure data is fetched on mount
    onMounted(async () => {
      try {
        if (!restaurantStore.currentSlug) {
          console.warn("No slug found. Unable to fetch restaurant data.");
        }
        isLoading.value = false; // Data is fetched or an error has occurred
      } catch (error) {
        console.error("Failed to fetch restaurant data:", error.message);
        isLoading.value = false; // Data loading completed, even if it failed
      }
    });

    return { pages, hasData, createPage, isLoading };
  },
};
</script>
