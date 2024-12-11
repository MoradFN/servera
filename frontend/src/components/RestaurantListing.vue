<script setup>
import { defineProps } from "vue";

defineProps({
  restaurants: {
    type: Array,
    default: () => [],
  },
  error: {
    type: String,
    default: null,
  },
});
</script>

<template>
  <div>
    <!-- Show restaurants -->
    <ul v-if="restaurants.length">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <li
          class="text-center bg-white p-6 rounded-lg shadow-md"
          v-for="restaurant in restaurants"
          :key="restaurant.slug"
        >
          <router-link
            :to="`/${restaurant.slug}`"
            class="font-bold text-blue-600 hover:text-blue-800"
          >
            {{ restaurant.restaurant_name }}
          </router-link>
          <p class="text-gray-500 mt-2">
            {{ restaurant.short_description }}
          </p>
        </li>
      </div>
    </ul>

    <!-- Show error -->
    <p v-else-if="error" class="text-red-500">{{ error }}</p>

    <!-- Show loading -->
    <p v-else class="text-gray-500">Loading...</p>
  </div>
</template>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0.5rem 0;
}
</style>
