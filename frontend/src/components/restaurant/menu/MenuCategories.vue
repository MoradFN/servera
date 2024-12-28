<template>
  <div v-if="categories.length > 0" class="menu-categories">
    <div v-for="category in categories" :key="category.id" class="category">
      <h2>{{ category.name }}</h2>

      <!-- Render items for this category using MenuItemCard -->
      <div class="items">
        <MenuItemCard
          v-for="item in categorizedItems[category.id]"
          :key="item.id"
          :item="item"
        />
      </div>

      <!-- Render child categories recursively -->
      <div v-if="category.children.length > 0" class="child-categories">
        <MenuCategories
          :categories="category.children"
          :categorizedItems="categorizedItems"
        />
      </div>
    </div>
  </div>

  <!-- Show a message if no categories are available -->
  <div v-else>
    <p>No menu categories or items available.</p>
  </div>
</template>

<script>
import MenuItemCard from "@/components/restaurant/menu/MenuItemCard.vue";

export default {
  name: "MenuCategories",
  props: {
    categories: {
      type: Array,
      required: true,
    },
    categorizedItems: {
      type: Object,
      required: true,
    },
  },
  components: {
    MenuItemCard,
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
.child-categories {
  margin-left: 1.5rem;
  border-left: 2px solid #ccc;
  padding-left: 1rem;
}
.items {
  margin-top: 1rem;
}
</style>
