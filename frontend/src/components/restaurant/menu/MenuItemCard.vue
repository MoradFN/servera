<template>
  <div class="menu-item-card">
    <h4>{{ item.name }}</h4>
    <p v-if="item.standard_price">Price: ${{ item.standard_price }}</p>
    <p v-if="item.family_price">Family Price: ${{ item.family_price }}</p>

    <!-- Render ingredients -->
    <ul v-if="item.ingredients.length > 0">
      <li v-for="ingredient in item.ingredients" :key="ingredient.id">
        - {{ ingredient.name }}
      </li>
    </ul>
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
.menu-item-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
h4 {
  margin: 0 0 0.5rem 0;
}
p {
  margin: 0.5rem 0;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 0.25rem 0;
}
</style>
