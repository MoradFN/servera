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

    <!-- <h4>Debug Items</h4>
    <pre>{{ items }}</pre> -->
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
/* Manage Items Container */
.manage-items {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px; /* Limit container width */
  margin-left: auto;
  margin-right: auto;
}

/* Section Title */
.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 1rem;
}

/* Item Row */
.item-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Input Fields */
.input {
  width: calc(50% - 1rem); /* Reduce input field width */
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  margin-right: 0.5rem; /* Add space between inputs */
}

/* Select Dropdown */
.select {
  width: calc(50% - 1rem); /* Match input width */
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: #ffffff;
}

/* Ingredients Section */
.ingredients {
  border-top: 1px solid #ccc;
  padding-top: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ingredient-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap; /* Wrap ingredients for smaller screens */
}

.ingredient-row .input {
  width: calc(70% - 1rem); /* Adjust ingredient input width */
}

.ingredient-row .remove-btn {
  width: calc(30% - 0.5rem);
  padding: 0.5rem;
  font-size: 0.8rem;
}

/* Buttons */
.add-btn,
.remove-btn {
  background-color: #007bff;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.add-btn:hover {
  background-color: #0056b3;
}

.remove-btn {
  background-color: #dc3545;
}

.remove-btn:hover {
  background-color: #a71d2a;
}

/* Item Buttons (Reorder/Remove) */
.item-buttons {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  margin-top: 1rem;
}

.item-buttons button {
  padding: 0.5rem;
  font-size: 0.9rem;
  border-radius: 4px;
}

/* Debug Section */
.debug-title {
  font-size: 1.2rem;
  color: #555;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
}

.debug-box {
  background-color: #f4f4f4;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Responsive Layout */
@media (max-width: 768px) {
  .input,
  .select {
    width: 100%; /* Full width for smaller screens */
  }

  .ingredient-row .input,
  .ingredient-row .remove-btn {
    width: 100%; /* Full width for ingredient inputs */
  }

  .manage-items {
    padding: 1rem;
  }
}
</style>
