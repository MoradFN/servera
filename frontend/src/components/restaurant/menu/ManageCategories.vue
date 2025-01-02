<template>
  <div class="manage-categories">
    <h3>Manage Categories</h3>

    <div
      v-for="(cat, idx) in categories"
      :key="cat.id ?? 'cat-' + idx"
      class="category-item"
    >
      <!-- Category name & display_order -->
      <div>
        <input
          v-model="cat.name"
          placeholder="Category Name"
          @input="emitCategoriesChanged"
        />
        <input
          type="number"
          v-model.number="cat.display_order"
          placeholder="Display Order"
          @input="emitCategoriesChanged"
        />
      </div>

      <!-- Parent dropdown -->
      <div class="parent-dropdown">
        <label>Parent:</label>
        <select
          :value="cat.parent_id ?? ''"
          @change="onChangeParent($event, cat, parentRef)"
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

      <!-- Reorder / remove -->
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

      <!-- If it has children, recurse with the same 'categories' reference -->
      <div v-if="cat.children?.length" class="child-categories">
        <ManageCategories
          :categories="cat.children"
          :allCategoriesFlat="allCategoriesFlat"
          :slug="slug"
          @categoriesChanged="emitCategoriesChanged"
        />
      </div>
    </div>

    <button @click="addCategory">Add Category</button>

    <h4>Debug</h4>
    <pre>{{ categories }}</pre>
  </div>
</template>

<script setup>
import { toRefs } from "vue";
import ManageCategories from "./ManageCategories.vue";

const props = defineProps({
  categories: { type: Array, required: true },
  allCategoriesFlat: { type: Array, required: true },
  slug: { type: String, required: true }, // If needed for any reason
});

const emit = defineEmits(["categoriesChanged"]);

/**
 * We do not create a local copy of props.categories,
 * we directly manipulate the parent's array reference.
 * This ensures parent sees changes immediately.
 */

/**
 * Emit that categories changed => triggers parent's onCategoriesChanged => changesMade=true
 */
function emitCategoriesChanged() {
  emit("categoriesChanged");
}

/**
 * Add a new top-level category
 */
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

/**
 * Remove category from 'parentCats'
 */
function removeCategory(parentCats, cat) {
  const idx = parentCats.indexOf(cat);
  if (idx !== -1) {
    parentCats.splice(idx, 1);
  }
  emitCategoriesChanged();
}

/**
 * Move category up/down
 */
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
 * Valid parents are all categories minus 'cat' itself + its descendants
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
 * onChangeParent => if value='', cat.parent_id=null => we forcibly re-tree so cat is top-level
 * otherwise parse the new parentId => re-tree cat under that parent's children
 */
function onChangeParent(e, cat, parentRef) {
  const newVal = e.target.value;
  if (!newVal) {
    // None => set cat.parent_id=null => move cat to top-level
    detachFromCurrentParent(cat);
    cat.parent_id = null;
    props.categories.push(cat); // top-level
  } else {
    const newParentId = parseInt(newVal);
    detachFromCurrentParent(cat);
    cat.parent_id = newParentId;
    // find the new parent in props.allCategoriesFlat
    const newParent = props.allCategoriesFlat.find((c) => c.id === newParentId);
    if (newParent) {
      if (!newParent.children) newParent.children = [];
      newParent.children.push(cat);
    }
  }
  emitCategoriesChanged();
}

/**
 * Detach cat from whichever parent's children array it currently resides in,
 * so it can become top-level or move to another parent's children.
 */
function detachFromCurrentParent(cat) {
  // 1) find cat in the entire tree
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
.category-item {
  border: 1px solid #aaa;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.child-categories {
  border-left: 2px dashed #ccc;
  margin-left: 1rem;
  padding-left: 1rem;
  width: 100%;
}
.parent-dropdown {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.buttons {
  display: flex;
  gap: 0.5rem;
}
</style>
