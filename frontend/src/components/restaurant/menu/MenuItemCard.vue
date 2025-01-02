<template>
  <div class="menu-item-card">
    <!-- Left Side: Pizza Name and Ingredients -->
    <div class="item-details">
      <h4 class="item-name">{{ item.name }}</h4>
      <p class="item-ingredients">
        {{ item.ingredients.map((ing) => ing.name).join(", ") }}
      </p>
    </div>

    <!-- Right Side: Prices -->
    <div class="item-prices">
      <p v-if="item.standard_price" class="price">
        Standard: {{ item.standard_price }} kr
      </p>
      <p v-if="item.family_price" class="price">
        Family: {{ item.family_price }} kr
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "MenuItemCard",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
/* Main Card Styling */
.menu-item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #003399; /* Dark blue background */
  color: #fff; /* White text for contrast */
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #002266;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Left Section: Item Details */
.item-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.item-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
}

.item-ingredients {
  font-size: 0.9rem;
  margin: 0.2rem 0;
  color: #e6e6e6; /* Slightly lighter for distinction */
}

/* Right Section: Prices */
.item-prices {
  text-align: right;
}

.price {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  color: #ffd700; /* Golden yellow for price */
}
</style>
