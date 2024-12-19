<template>
  <div v-if="pageData">
    <h1>{{ pageData[0]?.content }}</h1>
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
    restaurantStore.fetchPage(route.params.slug, "home");

    return {
      pageData: restaurantStore.pageData,
    };
  },
};
</script>
