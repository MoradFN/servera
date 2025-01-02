<template>
  <div class="manage-categories">
    <!-- Instead of a single static heading,
         each category now has its own "Manage {{ cat.name }}" heading -->
    <div
      v-for="(cat, idx) in categories"
      :key="cat.id ?? 'cat-' + idx"
      class="category-block"
    >
      <!-- Heading for this category -->
      <h2 class="section-title">Manage {{ cat.name || "New Category" }}</h2>

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
 * Exclude 'cat' and its descendants from valid parents, to avoid cycles.
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
 * If newVal='', cat.parent_id=null => forcibly re-tree top-level
 * Else parse the parent's ID => re-tree cat under that parent's children
 */
function onChangeParent(e, cat) {
  const newVal = e.target.value;
  if (!newVal) {
    detachFromCurrentParent(cat);
    cat.parent_id = null;
    props.categories.push(cat);
  } else {
    const newParentId = parseInt(newVal);
    detachFromCurrentParent(cat);
    cat.parent_id = newParentId;
    const newParent = props.allCategoriesFlat.find((c) => c.id === newParentId);
    if (newParent) {
      if (!newParent.children) newParent.children = [];
      newParent.children.push(cat);
    }
  }
  emitCategoriesChanged();
}

/**
 * Remove cat from whichever parent's children array it's in,
 * so it can become top-level or child of another parent.
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
/* Container for the entire manage categories UI */
.manage-categories {
  background-color: #fefefe;
  border: 1px solid #ccc;
  padding: 2rem;
  border-radius: 8px;
  max-width: 900px; /* Wider container for more "air" */
  margin: 2rem auto;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
}

/* Each category block */
.category-block {
  border: 1px solid #aaa;
  background-color: #fafafa;
  border-radius: 6px;
  margin-bottom: 2rem;
  padding: 1rem 1.5rem;
}

/* Heading with "Manage {{ cat.name }}" */
.section-title {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.3rem;
  font-weight: 600;
}

/* The row of fields (name, display order, parent dropdown) */
.category-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 150px;
}

label {
  font-size: 0.9rem;
  color: #555;
}

/* Input styling */
.text-input,
.number-input,
.select-input {
  padding: 0.5rem;
  font-size: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 
  The reorder / remove buttons 
*/
.category-actions,
.buttons {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

/* The top-level .child-categories are indented with dashed border */
.child-categories {
  border-left: 2px dashed #ccc;
  margin-left: 1rem;
  padding-left: 1.5rem;
  margin-top: 1rem;
}

/* Reusable button styling */
.action-btn {
  background-color: #007bff;
  border: none;
  color: white;
  font-size: 0.9rem;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1;
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
  display: inline-block;
  margin-top: 1.5rem;
  background-color: #28a745;
  color: #fff;
  border: none;
  font-size: 1rem;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.add-btn:hover {
  background-color: #218838;
}

/* Debug area styling */
.debug-section {
  margin-top: 2rem;
  background-color: #f9f9f9;
  border: 1px dashed #ccc;
  padding: 1rem;
  border-radius: 6px;
}
.debug-section h4 {
  margin-top: 0;
  font-size: 1rem;
}
.debug-section pre {
  max-height: 220px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ddd;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  line-height: 1.2;
}
</style>
