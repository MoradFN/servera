<!-- frontend\src\components\restaurant\menu\ManageItems.vue -->
<template>
  <div class="manage-items">
    <h2>Manage Items</h2>

    <!-- List existing items -->
    <div v-for="(it, idx) in items" :key="it.id ?? it.name" class="item-row">
      <div class="item-fields">
        <input
          v-model="it.name"
          placeholder="Item Name"
          @input="onInputChange"
        />
        <input
          type="number"
          v-model.number="it.standard_price"
          placeholder="Standard Price"
          @input="onInputChange"
        />
        <input
          type="number"
          v-model.number="it.family_price"
          placeholder="Family Price"
          @input="onInputChange"
        />
        <input
          type="number"
          v-model.number="it.display_order"
          placeholder="Display Order"
          @input="onInputChange"
        />

        <!-- Category dropdown -->
        <select v-model.number="it.category_id" @change="onInputChange">
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <!-- Ingredients management -->
        <div class="ingredients">
          <h4>Ingredients</h4>
          <div
            v-for="(ing, iIndex) in it.ingredients"
            :key="ing.id ?? ing.name"
            class="ingredient-row"
          >
            <span>{{ ing.name }}</span>
            <button @click="removeIngredient(it.ingredients, iIndex)">X</button>
          </div>
          <button @click="addIngredient(it)">Add Ingredient</button>
        </div>
      </div>

      <div class="item-buttons">
        <button :disabled="idx === 0" @click="moveItem(items, idx, -1)">
          ↑
        </button>
        <button
          :disabled="idx === items.length - 1"
          @click="moveItem(items, idx, 1)"
        >
          ↓
        </button>
        <button @click="removeItem(idx)">Remove</button>
      </div>
    </div>

    <button @click="addNewItem">Add New Item</button>
    <button @click="saveItems">Save Items</button>

    <!-- Debugging -->
    <h3>Debugging</h3>
    <pre>{{ items }}</pre>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";

const props = defineProps({
  initialItems: { type: Array, required: true },
  categories: { type: Array, required: true },
  slug: { type: String, required: true },
});

const emit = defineEmits(["itemsUpdated"]);

const store = useRestaurantStore();

// Local items array
const items = ref([...props.initialItems]);

function onInputChange() {
  console.log("Item changed");
}

// Add a brand new item
function addNewItem() {
  items.value.push({
    id: null, // indicates creation on server
    category_id: props.categories[0]?.id || null,
    name: "",
    standard_price: null,
    family_price: null,
    display_order: items.value.length + 1,
    ingredients: [],
  });
}

// Remove an item from the list
function removeItem(index) {
  items.value.splice(index, 1);
}

// Reorder an item up/down
function moveItem(array, index, direction) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= array.length) return;

  const [movedItem] = array.splice(index, 1);
  array.splice(newIndex, 0, movedItem);

  // update display_order
  array.forEach((it, i) => {
    it.display_order = i + 1;
  });
}

// Ingredients
function addIngredient(item) {
  item.ingredients.push({
    id: null, // new ingredient
    name: "New Ingredient",
  });
}

function removeIngredient(ingArray, iIndex) {
  ingArray.splice(iIndex, 1);
}

// Save items to server along with categories = []
async function saveItems() {
  try {
    await store.updateMenuData(props.slug, [], items.value);
    emit("itemsUpdated", items.value);
    alert("Items saved successfully!");
  } catch (err) {
    console.error("Failed to save items:", err.message);
  }
}
</script>

<style scoped>
.manage-items {
  margin-top: 1rem;
  border: 1px solid #ccc;
  padding: 1rem;
}
.item-row {
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
}
.item-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ingredient-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.item-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  justify-content: center;
}
</style>
