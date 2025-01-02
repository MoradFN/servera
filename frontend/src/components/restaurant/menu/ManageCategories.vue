<template>
  <div class="manage-categories">
    <h2>Manage Categories</h2>
    <!-- Loop over categories -->
    <div
      v-for="(cat, index) in categories"
      :key="cat.id ?? cat.name"
      class="category-item"
    >
      <input
        v-model="cat.name"
        placeholder="Category Name"
        @input="onInputChange"
      />
      <input
        type="number"
        v-model.number="cat.display_order"
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
        <button @click="removeCategory(categories, cat)">Remove</button>
      </div>

      <!-- Recurse for child categories -->
      <div
        v-if="cat.children && cat.children.length > 0"
        class="child-categories"
      >
        <ManageCategories
          :initialCategories="cat.children"
          :initialItems="items"
          :slug="slug"
          @categoriesUpdated="onChildCategoriesUpdated(cat)"
          @itemsUpdated="onChildItemsUpdated"
        />
      </div>
    </div>

    <button @click="addCategory">Add Category</button>
    <button @click="saveMenuData">Save Menu</button>

    <!-- Debugging output -->
    <h3>Debugging</h3>
    <pre>{{ categories }}</pre>
    <pre>{{ items }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";

// Define props
const props = defineProps({
  initialCategories: { type: Array, required: true },
  initialItems: { type: Array, required: true },
  slug: { type: String, required: true },
});

// Define emits
const emit = defineEmits(["categoriesUpdated", "itemsUpdated"]);

// Make local copies to freely mutate
const categories = ref([...props.initialCategories]);
const items = ref([...props.initialItems]);

const store = useRestaurantStore();

// Basic input change log
function onInputChange() {
  console.log("Category changed.");
}

// Add a new top-level category
function addCategory() {
  categories.value.push({
    id: null,
    parent_id: null,
    name: "",
    display_order: categories.value.length + 1,
    children: [],
  });
}

// Remove a category from an array
function removeCategory(parentCats, cat) {
  const idx = parentCats.indexOf(cat);
  if (idx !== -1) {
    parentCats.splice(idx, 1);
  }
}

// Move a category up/down in the array
function moveCategory(parentCats, index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= parentCats.length) return;

  const [movedCat] = parentCats.splice(index, 1);
  parentCats.splice(newIndex, 0, movedCat);

  // Update display_order in local
  parentCats.forEach((c, i) => {
    c.display_order = i + 1;
  });
}

// If a child ManageCategories updates categories
function onChildCategoriesUpdated(parentCat) {
  return (updatedChildren) => {
    parentCat.children = updatedChildren;
    // Emit the entire new categories array to the parent
    emit("categoriesUpdated", categories.value);
  };
}

// If a child ManageCategories updates items
function onChildItemsUpdated(updatedItems) {
  items.value = updatedItems;
  emit("itemsUpdated", items.value);
}

// Press "Save Menu" => call store.updateMenuData with local categories & items
async function saveMenuData() {
  try {
    await store.updateMenuData(props.slug, categories.value, items.value);
    // After success, emit up to parent
    emit("categoriesUpdated", categories.value);
    emit("itemsUpdated", items.value);

    alert("Menu saved successfully!");
  } catch (error) {
    console.error("Failed to save menu:", error.message);
  }
}
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
