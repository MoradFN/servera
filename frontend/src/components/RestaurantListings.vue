<template>
  <div class="restaurant-list">
    <h1>Our Subscribed Restaurants</h1>
    <ul>
      <li v-for="restaurant in restaurants" :key="restaurant.slug">
        <router-link :to="`/${restaurant.slug}`">
          {{ restaurant.restaurant_name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      restaurants: [],
    };
  },
  async created() {
    try {
      const response = await fetch(
        "http://localhost:8083/api/restaurants/subscribed"
      );
      const data = await response.json();
      if (data.success) {
        this.restaurants = data.data;
      } else {
        console.error("Failed to fetch restaurants");
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  },
};
</script>

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
