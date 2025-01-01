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
        <button :disabled="index === 0" @click="moveCategory(index, -1)">
          ↑
        </button>
        <button
          :disabled="index === categories.length - 1"
          @click="moveCategory(index, 1)"
        >
          ↓
        </button>
        <button @click="removeCategory(category)">Remove</button>
      </div>
    </div>
    <button @click="addCategory">Add Category</button>
    <button @click="saveCategories">Save Categories</button>

    <!-- Debugging/Testing Section -->
    <h3>Debugging</h3>
    <pre>{{ categories }}</pre>
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
  slug: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["categoriesUpdated"]);

const restaurantStore = useRestaurantStore();

const categories = ref([...props.initialCategories]);

// Method to add a new category
const addCategory = () => {
  categories.value.push({
    id: null,
    parent_id: null,
    name: "",
    display_order: categories.value.length + 1,
  });
};

// Method to remove a category
const removeCategory = (category) => {
  categories.value = categories.value.filter((c) => c !== category);
};

// Method to move a category up or down
const moveCategory = (index, direction) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= categories.value.length) return;

  // Swap categories
  const [movedCategory] = categories.value.splice(index, 1);
  categories.value.splice(newIndex, 0, movedCategory);

  // Update display_order
  categories.value.forEach((category, idx) => {
    category.display_order = idx + 1;
  });
};

// Save the categories to the server
const saveCategories = async () => {
  try {
    await restaurantStore.updateMenuCategories(props.slug, categories.value);
    emit("categoriesUpdated", categories.value);
    alert("Categories saved successfully!");
  } catch (error) {
    console.error("Failed to save categories:", error.message);
  }
};

// Placeholder for input change logging
const onInputChange = () => {
  console.log("Category changed.");
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
