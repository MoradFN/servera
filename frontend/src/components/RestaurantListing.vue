<script setup>
import { defineProps, ref } from "vue";

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

const showMore = ref({});
</script>

<template>
  <div>
    <!-- Show restaurants -->
    <ul v-if="restaurants.length">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Show each restaurant -->
        <!-- Style xpanderar en(fix). -->
        <li
          class="text-center bg-white p-6 rounded-lg shadow-md transition-all duration-300"
          v-for="restaurant in restaurants"
          :key="restaurant.slug"
          :class="{
            'max-h-40 overflow-hidden': !showMore[restaurant.slug],
            'max-h-auto': showMore[restaurant.slug],
          }"
        >
          <router-link
            :to="`/${restaurant.slug}`"
            class="font-bold text-blue-600 hover:text-blue-800"
          >
            {{ restaurant.restaurant_name }}
          </router-link>
          <p class="text-gray-500 mt-2">
            <span v-if="showMore[restaurant.slug]">
              {{ restaurant.short_description }}
              <button
                @click="showMore[restaurant.slug] = false"
                class="text-blue-400 hover:text-blue-600"
              >
                Show Less
              </button>
            </span>
            <span v-else>
              {{ restaurant.short_description.slice(0, 100) }}
              <span v-if="restaurant.short_description.length > 300">
                ...
                <button
                  @click="showMore[restaurant.slug] = true"
                  class="text-blue-400 hover:text-blue-600"
                >
                  Show More
                </button>
              </span>
            </span>
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
