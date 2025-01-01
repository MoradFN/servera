<template>
  <div class="manage-categories">
    <h2>Manage Categories</h2>
    <div
      v-for="(category, index) in categories"
      :key="category.id || category.name"
      class="category-item"
    >
      <input
        v-model="category.name"
        placeholder="Category Name"
        @input="onInputChange"
      />
      <input
        type="number"
        v-model.number="category.display_order"
        placeholder="Display Order"
        @input="onInputChange"
      />
      <div class="buttons">
        <button
          :disabled="index === 0"
          @click="moveCategory(categories, index, -1)"
        >
          ↑
        </button>
        <button
          :disabled="index === categories.length - 1"
          @click="moveCategory(categories, index, 1)"
        >
          ↓
        </button>
        <button @click="removeCategory(categories, category)">Remove</button>
      </div>

      <!-- Render child categories recursively -->
      <div
        v-if="category.children && category.children.length > 0"
        class="child-categories"
      >
        <ManageCategories
          :initialCategories="category.children"
          :slug="slug"
          @categoriesUpdated="onChildCategoriesUpdated(category)"
        />
      </div>
    </div>
    <button @click="addCategory">Add Category</button>
    <button @click="saveMenuData">Save Menu</button>

    <!-- Debugging/Testing Section -->
    <h3>Debugging</h3>
    <pre>{{ categories }}</pre>
    <pre>{{ items }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";

const props = defineProps({
  initialCategories: {
    type: Array,
    required: true,
  },
  initialItems: {
    type: Array,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["categoriesUpdated", "itemsUpdated"]);

const restaurantStore = useRestaurantStore();

const categories = ref([...props.initialCategories]);
const items = ref([...props.initialItems]);

// Add a new category
const addCategory = () => {
  categories.value.push({
    id: null,
    parent_id: null,
    name: "",
    display_order: categories.value.length + 1,
    children: [],
  });
};

// Remove a category
const removeCategory = (parentCategories, category) => {
  parentCategories.splice(parentCategories.indexOf(category), 1);
};

// Move a category up or down
const moveCategory = (parentCategories, index, direction) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= parentCategories.length) return;

  const [movedCategory] = parentCategories.splice(index, 1);
  parentCategories.splice(newIndex, 0, movedCategory);

  // Update display_order
  parentCategories.forEach((category, idx) => {
    category.display_order = idx + 1;
  });
};

// Save the menu data (categories and items) to the server
const saveMenuData = async () => {
  try {
    await restaurantStore.updateMenuData(
      props.slug,
      categories.value,
      items.value
    );
    emit("categoriesUpdated", categories.value);
    emit("itemsUpdated", items.value);
    alert("Menu saved successfully!");
  } catch (error) {
    console.error("Failed to save menu:", error.message);
  }
};

// Handle updates from child categories
const onChildCategoriesUpdated = (parentCategory) => (updatedChildren) => {
  parentCategory.children = updatedChildren;
  emit("categoriesUpdated", categories.value);
};

// Placeholder for input change logging
const onInputChange = () => {
  console.log("Menu data changed.");
};
</script>

<style scoped>
.manage-categories {
  margin-top: 1rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.child-categories {
  margin-left: 2rem;
  border-left: 2px solid #ccc;
  padding-left: 1rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
}

pre {
  background: #f4f4f4;
  padding: 1rem;
  border: 1px solid #ddd;
  overflow-x: auto;
}
</style>
