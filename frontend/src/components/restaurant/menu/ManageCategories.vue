<template>
  <div class="manage-categories">
    <h3>Manage Categories</h3>
    <div
      v-for="(cat, index) in categories"
      :key="cat.id ?? cat.name"
      class="category-item"
    >
      <input
        v-model="cat.name"
        placeholder="Category Name"
        @input="emitChanges"
      />
      <input
        type="number"
        v-model.number="cat.display_order"
        placeholder="Display Order"
        @input="emitChanges"
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
      <div v-if="cat.children?.length" class="child-categories">
        <ManageCategories
          :initialCategories="cat.children"
          @categoriesChanged="onChildUpdated(cat)"
        />
      </div>
    </div>

    <button @click="addCategory">Add Category</button>

    <h4>Debug</h4>
    <pre>{{ categories }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  initialCategories: { type: Array, required: true },
});
const emit = defineEmits(["categoriesChanged"]);

const categories = ref([...props.initialCategories]);

function emitChanges() {
  // whenever user modifies a category, we emit the entire array
  emit("categoriesChanged", categories.value);
}

function addCategory() {
  categories.value.push({
    id: null,
    parent_id: null,
    name: "",
    display_order: categories.value.length + 1,
    children: [],
  });
  emitChanges();
}

function removeCategory(parent, cat) {
  const idx = parent.indexOf(cat);
  if (idx !== -1) {
    parent.splice(idx, 1);
  }
  emitChanges();
}

function moveCategory(parent, index, dir) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= parent.length) return;
  const [moved] = parent.splice(index, 1);
  parent.splice(newIndex, 0, moved);
  // reassign display_order
  parent.forEach((c, i) => {
    c.display_order = i + 1;
  });
  emitChanges();
}

function onChildUpdated(parentCat) {
  return (updatedChildren) => {
    parentCat.children = updatedChildren;
    emitChanges();
  };
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
