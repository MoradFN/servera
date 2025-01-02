<template>
  <!-- If we have categories -->
  <div v-if="categories.length > 0">
    <!-- If it's top-level (level===0), wrap in a container that is full width -->
    <div v-if="level === 0" class="parent-categories">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category parent-category"
      >
        <h2>{{ category.name }}</h2>

        <!-- Items in this parent category -->
        <div class="items">
          <MenuItemCard
            v-for="item in categorizedItems[category.id]"
            :key="item.id"
            :item="item"
          />
        </div>

        <!-- Recursively render children if any -->
        <div v-if="category.children && category.children.length > 0">
          <MenuCategories
            :categories="category.children"
            :categorizedItems="categorizedItems"
            :level="level + 1"
          />
        </div>
      </div>
    </div>

    <!-- If it's child categories (level > 0), display in two columns -->
    <div v-else class="child-categories">
      <div
        v-for="category in categories"
        :key="category.id"
        class="child-category"
      >
        <h3>{{ category.name }}</h3>

        <!-- Items for this child category -->
        <div class="items">
          <MenuItemCard
            v-for="item in categorizedItems[category.id]"
            :key="item.id"
            :item="item"
          />
        </div>

        <!-- Recursively render deeper children if any -->
        <div v-if="category.children && category.children.length > 0">
          <MenuCategories
            :categories="category.children"
            :categorizedItems="categorizedItems"
            :level="level + 1"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- If no categories -->
  <div v-else>
    <p>No menu categories or items available.</p>
  </div>
</template>

<script>
import MenuItemCard from "@/components/restaurant/menu/MenuItemCard.vue";

export default {
  name: "MenuCategories",
  components: { MenuItemCard },
  props: {
    categories: {
      type: Array,
      required: true,
    },
    categorizedItems: {
      type: Object,
      required: true,
    },
    level: {
      type: Number,
      default: 0, // 0 means top-level (parent), 1+ means child
    },
  },
};
</script>

<style scoped>
/* Parent Categories Container (level===0) */
.parent-categories {
  /* Occupies the full width by default, often in a parent container */
  width: 100%;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.parent-category {
  /* Each top-level category is full-width block */
  margin-bottom: 2rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 1rem;
}

.parent-category h2 {
  margin-bottom: 0.5rem;
}

/* For child categories (level>0) */
.child-categories {
  /* Two-column grid for child categories */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.child-category {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 4px;
  background-color: #fafafa;
}

.child-category h3 {
  margin-bottom: 0.5rem;
}

/* Items styling */
.items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
