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

      <!-- Child categories -->
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

    <!-- Debugging -->
    <h3>Debugging</h3>
    <pre>{{ categories }}</pre>
    <pre>{{ items }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";

// Props
const props = defineProps({
  initialCategories: { type: Array, required: true },
  initialItems: { type: Array, required: true },
  slug: { type: String, required: true },
});

// Emits
const emit = defineEmits(["categoriesUpdated", "itemsUpdated"]);

// Local copies
const categories = ref([...props.initialCategories]);
const items = ref([...props.initialItems]);

const restaurantStore = useRestaurantStore();

// Methods
function onInputChange() {
  console.log("Category changed.");
}

function addCategory() {
  categories.value.push({
    id: null,
    parent_id: null,
    name: "",
    display_order: categories.value.length + 1,
    children: [],
  });
}

function removeCategory(parentCats, cat) {
  const idx = parentCats.indexOf(cat);
  if (idx !== -1) {
    parentCats.splice(idx, 1);
  }
}

function moveCategory(parentCats, index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= parentCats.length) return;

  const [movedCategory] = parentCats.splice(index, 1);
  parentCats.splice(newIndex, 0, movedCategory);

  // Update display_order
  parentCats.forEach((cat, i) => {
    cat.display_order = i + 1;
  });
}

// For child categories
function onChildCategoriesUpdated(parentCat) {
  return (updatedChildren) => {
    parentCat.children = updatedChildren;
    emit("categoriesUpdated", categories.value);
  };
}

// For child items
function onChildItemsUpdated(updatedItems) {
  // If a child ManageCategories updates items, we share that upward
  items.value = updatedItems;
  emit("itemsUpdated", items.value);
}

async function saveMenuData() {
  try {
    // We call the store's updateMenuData with local categories + items
    await restaurantStore.updateMenuData(
      props.slug,
      categories.value,
      items.value
    );

    // Emit updated arrays to parent
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
