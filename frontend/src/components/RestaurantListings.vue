<script setup>
import RestaurantListing from "./RestaurantListing.vue";
import axios from "axios";
import { ref, onMounted } from "vue";

// State variables
const restaurants = ref([]);
const error = ref(null);

// Fetch data
const fetchSubscribedRestaurants = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8083/api/restaurants/subscribed"
    );
    if (response.data.success) {
      restaurants.value = response.data.data;
    } else {
      error.value = "Failed to fetch restaurants.";
    }
  } catch (err) {
    error.value = "Error fetching restaurants.";
    console.error(err);
  }
};

// Fetch data on component mount
onMounted(fetchSubscribedRestaurants);
</script>

<template>
  <section class="bg-blue-50 px-4 py-10">
    <div class="container-xl lg:container m-auto">
      <h2 class="text-3xl font-bold text-blue-400 mb-6 text-center">
        Our Subscribed Restaurants
      </h2>

      <RestaurantListing :restaurants="restaurants" :error="error" />
    </div>
  </section>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
}
</style>
