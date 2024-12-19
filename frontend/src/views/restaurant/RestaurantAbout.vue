<template>
  <div v-if="pageData">
    <h2>About Us</h2>
    <p v-for="section in pageData" :key="section.section_order">
      {{ section.content }}
    </p>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import { useRestaurantStore } from "@/stores/restaurantStore.js";

export default {
  setup() {
    const route = useRoute();
    const restaurantStore = useRestaurantStore();
    restaurantStore.fetchPage(route.params.slug, "about");

    return {
      pageData: restaurantStore.pageData,
    };
  },
};
</script>
