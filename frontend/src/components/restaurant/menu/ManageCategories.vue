<template>
  <div class="manage-categories">
    <h2 class="section-title">Manage Categories</h2>

    <!-- Loop over categories -->
    <div
      v-for="(cat, idx) in categories"
      :key="cat.id ?? 'cat-' + idx"
      class="category-item"
    >
      <!-- Category fields row -->
      <div class="category-fields">
        <!-- Name and Display Order -->
        <div class="input-group">
          <label>Name</label>
          <input
            v-model="cat.name"
            type="text"
            class="text-input"
            placeholder="Category Name"
            @input="emitCategoriesChanged"
          />
        </div>

        <div class="input-group">
          <label>Display Order</label>
          <input
            type="number"
            v-model.number="cat.display_order"
            class="number-input"
            placeholder="Display Order"
            @input="emitCategoriesChanged"
          />
        </div>

        <!-- Parent dropdown -->
        <div class="input-group parent-dropdown">
          <label>Parent</label>
          <select
            :value="cat.parent_id ?? ''"
            @change="onChangeParent($event, cat)"
            class="select-input"
          >
            <option value="">None (Top-Level)</option>
            <option
              v-for="pCat in validParentsFor(cat)"
              :key="pCat.id"
              :value="pCat.id"
            >
              {{ pCat.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Action buttons: reorder / remove -->
      <div class="category-actions">
        <button
          class="action-btn"
          :disabled="idx === 0"
          @click="moveCategory(categories, idx, -1)"
          title="Move Up"
        >
          ↑
        </button>
        <button
          class="action-btn"
          :disabled="idx === categories.length - 1"
          @click="moveCategory(categories, idx, 1)"
          title="Move Down"
        >
          ↓
        </button>
        <button
          class="action-btn remove-btn"
          @click="removeCategory(categories, cat)"
          title="Remove Category"
        >
          Remove
        </button>
      </div>

      <!-- If it has children, recurse with the same 'categories' reference -->
      <div v-if="cat.children?.length" class="child-categories">
        <!-- Recurse to handle subcategories -->
        <ManageCategories
          :categories="cat.children"
          :allCategoriesFlat="allCategoriesFlat"
          :slug="slug"
          @categoriesChanged="emitCategoriesChanged"
        />
      </div>
    </div>

    <!-- Add top-level category -->
    <button class="add-btn" @click="addCategory">+ Add Category</button>

    <!-- Debug section -->
    <div class="debug-section">
      <h4>Debug Data</h4>
      <pre>{{ categories }}</pre>
    </div>
  </div>
</template>

<script setup>
import ManageCategories from "./ManageCategories.vue";

const props = defineProps({
  categories: { type: Array, required: true },
  allCategoriesFlat: { type: Array, required: true },
  slug: { type: String, required: true },
});

const emit = defineEmits(["categoriesChanged"]);

/**
 * We do not create a local copy of props.categories,
 * we directly manipulate the parent's array reference.
 * This ensures the parent sees changes immediately.
 */

function emitCategoriesChanged() {
  emit("categoriesChanged");
}

/** Add a new top-level category */
function addCategory() {
  props.categories.push({
    id: null,
    parent_id: null,
    name: "",
    display_order: props.categories.length + 1,
    children: [],
  });
  emitCategoriesChanged();
}

/** Remove category from 'parentCats' */
function removeCategory(parentCats, cat) {
  const idx = parentCats.indexOf(cat);
  if (idx !== -1) {
    parentCats.splice(idx, 1);
  }
  emitCategoriesChanged();
}

/** Move category up/down */
function moveCategory(parentCats, index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= parentCats.length) return;
  const [movedCat] = parentCats.splice(index, 1);
  parentCats.splice(newIndex, 0, movedCat);
  // reassign display_order
  parentCats.forEach((c, i) => {
    c.display_order = i + 1;
  });
  emitCategoriesChanged();
}

/**
 * Exclude 'cat' and its descendants from the valid parents,
 * to avoid cyclical references.
 */
function validParentsFor(cat) {
  const invalidIds = new Set();
  gatherIds(cat, invalidIds);
  return props.allCategoriesFlat.filter((c) => !invalidIds.has(c.id));
}
function gatherIds(cat, set) {
  if (cat.id != null) set.add(cat.id);
  if (cat.children) {
    cat.children.forEach((child) => gatherIds(child, set));
  }
}

/**
 * onChangeParent => if value='', cat.parent_id=null => forcibly re-tree so cat is top-level
 * otherwise parse the new parentId => re-tree cat under that parent's children
 */
function onChangeParent(e, cat) {
  const newVal = e.target.value;
  if (!newVal) {
    // None => set cat.parent_id=null => move cat to top-level
    detachFromCurrentParent(cat);
    cat.parent_id = null;
    props.categories.push(cat);
  } else {
    const newParentId = parseInt(newVal);
    detachFromCurrentParent(cat);
    cat.parent_id = newParentId;
    // find the new parent in allCategoriesFlat
    const newParent = props.allCategoriesFlat.find((c) => c.id === newParentId);
    if (newParent) {
      if (!newParent.children) newParent.children = [];
      newParent.children.push(cat);
    }
  }
  emitCategoriesChanged();
}

/**
 * Remove cat from whichever parent's children array it currently resides in,
 * so it can become top-level or move to another parent's children.
 */
function detachFromCurrentParent(cat) {
  function removeCatFromChildren(parentCats) {
    for (let i = 0; i < parentCats.length; i++) {
      if (parentCats[i] === cat) {
        parentCats.splice(i, 1);
        return true;
      }
      if (parentCats[i].children?.length) {
        const found = removeCatFromChildren(parentCats[i].children);
        if (found) return true;
      }
    }
    return false;
  }
  removeCatFromChildren(props.categories);
}
</script>

<style scoped>
.manage-categories {
  background-color: #fefefe;
  border: 1px solid #ccc;
  padding: 1.5rem;
  border-radius: 6px;
  max-width: 700px;
  margin: 2rem auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.4rem;
}

/* Each category row */
.category-item {
  border: 1px solid #aaa;
  background-color: #fafafa;
  border-radius: 4px;
  margin-bottom: 1rem;
  padding: 1rem;
}

/* 
  The row of fields (name, display order, parent dropdown) 
  We'll space them horizontally 
*/
.category-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 140px;
}

/* 
  The action buttons for reordering, removing 
*/
.category-actions,
.buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* The top-level .child-categories are indented with dashed border */
.child-categories {
  border-left: 2px dashed #ccc;
  margin-left: 1rem;
  padding-left: 1rem;
  margin-top: 1rem;
}

/* The input & select styling */
.text-input,
.number-input,
.select-input {
  padding: 0.4rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 
  The reorder / remove buttons 
*/
.action-btn {
  background-color: #007bff;
  border: none;
  color: white;
  font-size: 0.9rem;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.action-btn:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.action-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.remove-btn {
  background-color: #dc3545;
}

.remove-btn:hover {
  background-color: #b02a37;
}

/* Add category button */
.add-btn {
  margin-top: 1rem;
  background-color: #28a745;
  color: #fff;
  border: none;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.add-btn:hover {
  background-color: #218838;
}

/* Debug area styling */
.debug-section {
  margin-top: 1rem;
  background-color: #f9f9f9;
  border: 1px dashed #ccc;
  padding: 1rem;
  border-radius: 4px;
}
.debug-section h4 {
  margin-top: 0;
}
.debug-section pre {
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
