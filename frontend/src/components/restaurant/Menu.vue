<template>
  <div>
    <!-- Use the MenuSections component -->
    <MenuSections :sections="menuSections" />

    <!-- Use the MenuCategories component -->
    <MenuCategories
      :categories="menuCategories"
      :categorizedItems="categorizedItems"
    />
  </div>
</template>

<script>
import { useRestaurantStore } from "@/stores/restaurantStore";
import { computed } from "vue";
import MenuSections from "@/components/restaurant/menu/MenuSections.vue";
import MenuCategories from "@/components/restaurant/menu/MenuCategories.vue";

export default {
  components: {
    MenuSections,
    MenuCategories,
  },
  setup() {
    const store = useRestaurantStore();

    // Computed properties for menu sections, categories, and items
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

    return {
      menuSections,
      menuCategories,
      categorizedItems,
    };
  },
};
</script>
