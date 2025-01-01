<template>
  <div class="manage-categories">
    <h2>Manage Categories</h2>
    <draggable
      v-model="categories"
      @end="onDragEnd"
      class="category-list"
      handle=".drag-handle"
    >
      <div
        v-for="category in categories"
        :key="category.id || category.name"
        class="category-item"
      >
        <div class="drag-handle">☰</div>
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
        <button @click="removeCategory(category)">Remove</button>
      </div>
    </draggable>
    <button @click="addCategory">Add Category</button>
    <button @click="saveCategories">Save Categories</button>

    <!-- Debugging/Testing Section -->
    <h3>Debugging</h3>
    <pre>{{ categories }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import { useRestaurantStore } from "@/stores/restaurantStore";

const draggable = VueDraggableNext;

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
const onInputChange = () => console.log("Category changed.");

const addCategory = () => {
  categories.value.push({
    id: null,
    parent_id: null,
    name: "",
    display_order: categories.value.length + 1,
  });
};

const removeCategory = (category) => {
  categories.value = categories.value.filter((c) => c !== category);
};

const onDragEnd = () => {
  categories.value.forEach((category, index) => {
    category.display_order = index + 1;
  });
};

const saveCategories = async () => {
  try {
    await restaurantStore.updateMenuCategories(props.slug, categories.value);
    emit("categoriesUpdated", categories.value);
    alert("Categories saved successfully!");
  } catch (error) {
    console.error("Failed to save categories:", error.message);
  }
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

.drag-handle {
  cursor: grab;
}

pre {
  background: #f4f4f4;
  padding: 1rem;
  border: 1px solid #ddd;
  overflow-x: auto;
}
</style>
