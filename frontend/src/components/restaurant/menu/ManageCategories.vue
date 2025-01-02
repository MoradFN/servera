<template>
  <div class="manage-categories">
    <h3>Manage Categories</h3>

    <div
      v-for="(cat, idx) in categories"
      :key="cat.id ?? 'cat-' + idx"
      class="category-item"
    >
      <!-- Category Name & display_order -->
      <div>
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
      </div>

      <!-- Optional Parent Category Dropdown -->
      <div class="parent-category-dropdown">
        <label>Parent:</label>
        <select
          :value="cat.parent_id ?? ''"
          @change="onChangeParent($event, cat)"
        >
          <!-- Option for "None" -->
          <option :value="''">None (Top-Level)</option>
          <option
            v-for="pCat in validParentsFor(cat)"
            :key="pCat.id"
            :value="pCat.id"
          >
            {{ pCat.name }}
          </option>
        </select>
      </div>

      <!-- Reorder/Remove -->
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

      <!-- Children -->
      <div v-if="cat.children?.length" class="child-categories">
        <ManageCategories
          :initialCategories="cat.children"
          :allCategoriesFlat="allCategoriesFlat"
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
import { ref, computed } from "vue";
import ManageCategories from "./ManageCategories.vue";

const props = defineProps({
  initialCategories: { type: Array, required: true },
  allCategoriesFlat: { type: Array, required: true },
});
const emit = defineEmits(["categoriesChanged"]);

// local categories
const categories = ref([...props.initialCategories]);

// "emitChanges" triggers an event so the parent can unify changes
function emitChanges() {
  emit("categoriesChanged", categories.value);
}

// Add new top-level category
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

// Remove a category from an array
function removeCategory(parentCats, cat) {
  const idx = parentCats.indexOf(cat);
  if (idx !== -1) {
    parentCats.splice(idx, 1);
  }
  emitChanges();
}

// Reorder a category up/down
function moveCategory(parentCats, index, dir) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= parentCats.length) return;
  const [moved] = parentCats.splice(index, 1);
  parentCats.splice(newIndex, 0, moved);

  // Reassign display_order
  parentCats.forEach((c, i) => {
    c.display_order = i + 1;
  });
  emitChanges();
}

// If a child ManageCategories updates categories
function onChildUpdated(parentCat) {
  return (updatedChildren) => {
    parentCat.children = updatedChildren;
    emitChanges();
  };
}

/**
 * Provide a list of valid parent categories for "cat"
 * We'll exclude "cat" itself and its descendants to avoid cycles
 * Also exclude any child categories to prevent loops
 */
function validParentsFor(cat) {
  // 1) gather cat + its descendants
  const invalidIds = new Set();
  function gatherIds(c) {
    invalidIds.add(c.id);
    if (c.children) {
      c.children.forEach(gatherIds);
    }
  }
  gatherIds(cat);

  // 2) Filter out cat + descendants from "allCategoriesFlat"
  return props.allCategoriesFlat.filter((pCat) => !invalidIds.has(pCat.id));
}

/**
 * On changing parent from dropdown
 * If value = '', set parent_id = null => top-level
 * Otherwise, set parent_id to selected category
 */
function onChangeParent(evt, cat) {
  const newVal = evt.target.value;
  if (!newVal) {
    cat.parent_id = null;
  } else {
    const parentId = parseInt(newVal);
    cat.parent_id = parentId;
  }
  emitChanges();
}
</script>

<style scoped>
.manage-categories {
  margin-top: 1rem;
}
.category-item {
  border: 1px solid #aaa;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.parent-category-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.child-categories {
  border-left: 2px dashed #ccc;
  margin-left: 1rem;
  padding-left: 1rem;
  width: 100%;
}
.buttons {
  display: flex;
  gap: 0.5rem;
}
</style>
