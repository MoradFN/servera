<template>
  <div>
    <h1>Restaurant Test Page</h1>
    <button @click="fetchData">Fetch Restaurant Data</button>
    <pre v-if="restaurantData">{{ restaurantData }}</pre>
  </div>
</template>

<script>
import { useRestaurantStore } from "@/stores/restaurantStore";
import { onMounted } from "vue";

export default {
  setup() {
    const restaurantStore = useRestaurantStore();

    const fetchData = async () => {
      try {
        const data = await restaurantStore.fetchRestaurantData("morad-2");
        console.log("Fetched Data:", data);
      } catch (error) {
        console.error("Fetch Failed:", error.message);
      }
    };

    // Automatically fetch on page load
    onMounted(fetchData);

    return {
      fetchData,
      restaurantData: restaurantStore.restaurantData,
    };
  },
};
</script>
