<template>
  <div>
    <!-- Render sections dynamically -->
    <div v-for="section in menuSections" :key="section.section_order">
      <h1 v-if="section.section_type === 'title'">{{ section.content }}</h1>
      <p v-else-if="section.section_type === 'text'">{{ section.content }}</p>
      <img
        v-else-if="section.section_type === 'image'"
        :src="section.content"
        alt="Image Content"
      />
      <p v-else>Unsupported section type: {{ section.section_type }}</p>
    </div>

    <!-- Render categories and items -->
    <div v-if="menuCategories.length > 0" class="menu-categories">
      <div
        v-for="category in menuCategories"
        :key="category.id"
        class="category"
      >
        <h2>{{ category.name }}</h2>
        <ul>
          <li v-for="item in categorizedItems[category.id]" :key="item.id">
            <strong>{{ item.name }}</strong>
            <span v-if="item.standard_price">- ${{ item.standard_price }}</span>
            <span v-if="item.family_price"
              >(Family: ${{ item.family_price }})</span
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- Show a message if no categories or items are available -->
    <div v-else>
      <p>No menu categories or items available.</p>
    </div>
  </div>
</template>

<script>
import { useRestaurantStore } from "@/stores/restaurantStore";
import { computed } from "vue";

export default {
  setup() {
    const store = useRestaurantStore();

    // Computed properties for menu sections, categories, and items
    const menuData = computed(() => store.restaurantData?.menu || {});
    const menuSections = computed(() => menuData.value.sections || []);
    const menuCategories = computed(() => menuData.value.categories || []);
    const menuItems = computed(() => menuData.value.items || []);

    // Pre-compute categorized items
    const categorizedItems = computed(() => {
      const mapping = {};
      menuCategories.value.forEach((category) => {
        mapping[category.id] = menuItems.value.filter(
          (item) => item.category_id === category.id
        );
      });
      return mapping;
    });

    return {
      menuSections,
      menuCategories,
      categorizedItems, // Use pre-computed categorized items
    };
  },
};
</script>

<style scoped>
.menu-categories {
  margin-top: 2rem;
}
.category {
  margin-bottom: 1.5rem;
}
h2 {
  margin-bottom: 0.5rem;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0.5rem 0;
}
</style>
