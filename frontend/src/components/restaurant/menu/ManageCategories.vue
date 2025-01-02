<template>
  <div class="manage-categories">
    <h3>Manage Categories</h3>

    <div
      v-for="(cat, idx) in categories"
      :key="cat.id ?? 'cat-' + idx"
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
          :disabled="idx === 0"
          @click="moveCategory(categories, idx, -1)"
        >
          ↑
        </button>
        <button
          :disabled="idx === categories.length - 1"
          @click="moveCategory(categories, idx, 1)"
        >
          ↓
        </button>
        <button @click="removeCategory(categories, cat)">Remove</button>
      </div>

      <!-- Recurse for children -->
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

function removeCategory(parentCats, cat) {
  const idx = parentCats.indexOf(cat);
  if (idx !== -1) {
    parentCats.splice(idx, 1);
  }
  emitChanges();
}

function moveCategory(parentCats, index, dir) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= parentCats.length) return;
  const [moved] = parentCats.splice(index, 1);
  parentCats.splice(newIndex, 0, moved);
  // update display_order
  parentCats.forEach((c, i) => {
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
  padding: 0.5rem;
}

.child-categories {
  margin-left: 2rem;
  border-left: 2px solid #ccc;
  margin-left: 1rem;
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
