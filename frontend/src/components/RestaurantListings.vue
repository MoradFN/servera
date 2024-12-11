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
  <div class="restaurant-list">
    <h1>Our Subscribed Restaurants</h1>

    <!-- Show restaurants -->
    <ul v-if="restaurants.length">
      <li v-for="restaurant in restaurants" :key="restaurant.slug">
        <router-link :to="`/${restaurant.slug}`">
          {{ restaurant.restaurant_name }}
        </router-link>
      </li>
    </ul>

    <!-- Show error -->
    <p v-else-if="error">{{ error }}</p>

    <!-- Show loading -->
    <p v-else>Loading...</p>
  </div>
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
