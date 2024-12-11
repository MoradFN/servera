<script setup>
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
onMounted(() => {
  fetchSubscribedRestaurants();
});
</script>

<template>
  <section class="bg-blue-50 px-4 py-10">
    <div class="container-xl lg:container m-auto">
      <h2 class="text-3xl font-bold text-blue-400 mb-6 text-center">
        Our Subscribed Restaurants
      </h2>
      <!-- Show restaurants -->
      <ul v-if="restaurants.length">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <li
            class="text-center bg-white p-6 rounded-lg shadow-md"
            v-for="restaurant in restaurants"
            :key="restaurant.slug"
          >
            <router-link :to="`/${restaurant.slug}`">
              {{ restaurant.restaurant_name }}
            </router-link>
          </li>
        </div>
      </ul>

      <!-- Show error -->
      <p v-else-if="error">{{ error }}</p>

      <!-- Show loading -->
      <p v-else>Loading...</p>
    </div>
  </section>
</template>

<style scoped>
.restaurant-list {
  padding: 1rem;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0.5rem 0;
}
</style>
