<template>
  <div v-if="menuData">
    <h2>Our Menu</h2>
    <div v-for="category in menuData" :key="category.id">
      <h3>{{ category.name }}</h3>
      <ul>
        <li v-for="item in category.items" :key="item.id">
          {{ item.name }} - ${{ item.standard_price }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import { useRestaurantStore } from "@/stores/restaurantStore.js";

export default {
  setup() {
    const route = useRoute();
    const restaurantStore = useRestaurantStore();
    restaurantStore.fetchMenu(route.params.slug);

    return {
      menuData: restaurantStore.menuData,
    };
  },
};
</script>
