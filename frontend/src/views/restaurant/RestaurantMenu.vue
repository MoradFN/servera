<template>
  <div>
    <!-- If the menu page is found, render the content -->
    <div v-if="pageIsFound">
      <!-- Render sections -->
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

      <!-- Render categories and items if they exist -->
      <div v-if="menuCategories.length > 0" class="menu-categories">
        <div
          v-for="category in menuCategories"
          :key="category.id"
          class="category"
        >
          <h2>{{ category.name }}</h2>
          <!-- List items for this category -->
          <ul>
            <li v-for="item in categorizedItems[category.id]" :key="item.id">
              <strong>{{ item.name }}</strong>
              <span v-if="item.standard_price"
                >- ${{ item.standard_price }}</span
              >
              <span v-if="item.family_price"
                >(Family: ${{ item.family_price }})</span
              >

              <!-- Ingredients -->
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
              <ul>
                <li v-for="item in categorizedItems[child.id]" :key="item.id">
                  <strong>{{ item.name }}</strong>
                  <span v-if="item.standard_price"
                    >- ${{ item.standard_price }}</span
                  >
                  <span v-if="item.family_price"
                    >(Family: ${{ item.family_price }})</span
                  >

                  <!-- Ingredients -->
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

      <!-- No categories found -->
      <div v-else>
        <p>No menu categories or items available.</p>
      </div>
    </div>

    <!-- If the menu page is missing, decide what to show -->
    <div v-else>
      <p v-if="isOwner">
        This page doesn't exist yet. You can create it in the Admin Dashboard.
      </p>
      <p v-else>404 - Page not found</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  restaurantData: { type: Object, required: true },
  pageStatus: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
});

// Check if the menu page is actually "found" or "missing"
const pageIsFound = computed(() => props.pageStatus.menu === "found");

// Extract menu data if it's "found"
const menuData = computed(() => props.restaurantData.menu || {});

// Sections
const menuSections = computed(() => menuData.value.sections || []);

// Categories & Items
const menuCategories = computed(() => menuData.value.categories || []);
const menuItems = computed(() => menuData.value.items || []);

// Helper: Map categories to their items (including child categories)
const categorizedItems = computed(() => {
  const mapping = {};

  // Recursive function
  const mapItemsToCategory = (category) => {
    // Items that belong to this category
    mapping[category.id] = menuItems.value.filter(
      (item) => item.category_id === category.id
    );

    // Child categories
    if (category.children && category.children.length > 0) {
      category.children.forEach((child) => {
        mapItemsToCategory(child);
      });
    }
  };

  // For each top-level category, map items recursively
  menuCategories.value.forEach((category) => {
    mapItemsToCategory(category);
  });

  return mapping;
});
</script>
