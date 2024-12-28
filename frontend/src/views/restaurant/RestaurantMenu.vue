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
        <!-- Render items for this category -->
        <ul>
          <li v-for="item in categorizedItems[category.id]" :key="item.id">
            <strong>{{ item.name }}</strong>
            <span v-if="item.standard_price">- ${{ item.standard_price }}</span>
            <span v-if="item.family_price"
              >(Family: ${{ item.family_price }})</span
            >

            <!-- Render ingredients for this item -->
            <ul v-if="item.ingredients.length > 0">
              <li v-for="ingredient in item.ingredients" :key="ingredient.id">
                - {{ ingredient.name }}
              </li>
            </ul>
          </li>
        </ul>

        <!-- Render child categories recursively -->
        <div v-if="category.children.length > 0" class="child-categories">
          <div
            v-for="child in category.children"
            :key="child.id"
            class="category"
          >
            <h3>{{ child.name }}</h3>
            <!-- Render items for this child category -->
            <ul>
              <li v-for="item in categorizedItems[child.id]" :key="item.id">
                <strong>{{ item.name }}</strong>
                <span v-if="item.standard_price"
                  >- ${{ item.standard_price }}</span
                >
                <span v-if="item.family_price"
                  >(Family: ${{ item.family_price }})</span
                >

                <!-- Render ingredients for this item -->
                <ul v-if="item.ingredients.length > 0">
                  <li
                    v-for="ingredient in item.ingredients"
                    :key="ingredient.id"
                  >
                    - {{ ingredient.name }}
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Show a message if no categories or items are available -->
    <div v-else>
      <p>No menu categories or items available.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";

// Access the store
const store = useRestaurantStore();

// Extract menu data
const menuData = computed(() => store.restaurantData?.menu || {});
const menuSections = computed(() => menuData.value.sections || []);
const menuCategories = computed(() => menuData.value.categories || []);
const menuItems = computed(() => menuData.value.items || []);

// Map categories to items, including parent and child categories
const categorizedItems = computed(() => {
  const mapping = {};

  // Recursive function to map items to a category and its children
  const mapItemsToCategory = (category) => {
    // Map items to the current category
    mapping[category.id] = menuItems.value.filter(
      (item) => item.category_id === category.id
    );

    // If the category has children, map items for each child recursively
    category.children.forEach((child) => {
      mapItemsToCategory(child);
    });
  };

  // Map items for all top-level categories (including their children recursively)
  menuCategories.value.forEach((category) => {
    mapItemsToCategory(category);
  });

  return mapping;
});
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

.child-categories {
  margin-left: 1.5rem;
  border-left: 2px solid #ccc;
  padding-left: 1rem;
}
</style>
