<template>
  <div class="manage-items">
    <h3>Manage Items</h3>

    <div
      v-for="(item, index) in items"
      :key="item.id ?? 'new-' + index"
      class="item-row"
    >
      <div>
        <input
          v-model="item.name"
          placeholder="Item Name"
          @input="emitChanges"
        />
        <input
          type="number"
          v-model.number="item.standard_price"
          placeholder="Standard Price"
          @input="emitChanges"
        />
        <input
          type="number"
          v-model.number="item.family_price"
          placeholder="Family Price"
          @input="emitChanges"
        />
        <input
          type="number"
          v-model.number="item.display_order"
          placeholder="Display Order"
          @input="emitChanges"
        />

        <!-- Category dropdown: includes child categories, since we have allCategoriesFlat -->
        <select v-model.number="item.category_id" @change="emitChanges">
          <option v-for="cat in allCategories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Ingredients -->
      <div class="ingredients">
        <h4>Ingredients</h4>
        <div
          v-for="(ing, iIndex) in item.ingredients"
          :key="ing.id ?? 'i' + iIndex"
          class="ingredient-row"
        >
          <input
            v-model="ing.name"
            placeholder="Ingredient Name"
            @input="emitChanges"
          />
          <button @click="removeIngredient(item.ingredients, iIndex)">X</button>
        </div>
        <button @click="addIngredient(item)">+ Add Ingredient</button>
      </div>

      <!-- Reorder / remove item -->
      <div class="item-buttons">
        <button :disabled="index === 0" @click="moveItem(index, -1)">↑</button>
        <button
          :disabled="index === items.length - 1"
          @click="moveItem(index, 1)"
        >
          ↓
        </button>
        <button @click="removeItem(index)">Remove</button>
      </div>
    </div>

    <button @click="addNewItem">Add New Item</button>

    <h4>Debug Items</h4>
    <pre>{{ items }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Props
const props = defineProps({
  initialItems: { type: Array, required: true },
  allCategories: { type: Array, required: true },
  slug: { type: String, required: true },
});
// Emit
const emit = defineEmits(["itemsChanged"]);

// We keep a local copy of items
const items = ref([...props.initialItems]);

function emitChanges() {
  emit("itemsChanged", items.value);
}

function addNewItem() {
  items.value.push({
    id: null,
    category_id: props.allCategories[0]?.id || null,
    name: "",
    standard_price: null,
    family_price: null,
    display_order: items.value.length + 1,
    ingredients: [],
  });
  emitChanges();
}

function removeItem(index) {
  items.value.splice(index, 1);
  emitChanges();
}

function moveItem(index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= items.value.length) return;
  const [moved] = items.value.splice(index, 1);
  items.value.splice(newIndex, 0, moved);

  // update display_order
  items.value.forEach((it, i) => {
    it.display_order = i + 1;
  });
  emitChanges();
}

// Add new ingredient
function addIngredient(item) {
  item.ingredients.push({
    id: null,
    name: "",
  });
  emitChanges();
}

// Remove an ingredient
function removeIngredient(ingArray, iIndex) {
  ingArray.splice(iIndex, 1);
  emitChanges();
}
</script>

<style scoped>
.manage-items {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-top: 1rem;
}
.item-row {
  display: flex;
  gap: 1rem;
  border: 1px dashed #ccc;
  margin-bottom: 1rem;
  padding: 0.5rem;
}
.ingredients {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ingredient-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.item-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.item-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
