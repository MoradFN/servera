<template>
  <RestaurantLayout>
    <template #default>
      <div>
        <h1>Menu Management</h1>

        <!-- Button to open the modal -->
        <button @click="openModal">Add New Menu Item</button>

        <div class="menu-list">
          <div v-for="item in menu" :key="item.id">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <strong>{{ item.price }} €</strong>
          </div>
        </div>
      </div>
    </template>
  </RestaurantLayout>
</template>

<script>
export default {
  data() {
    return {
      menu: [
        { id: 1, name: "Pizza", description: "Cheese and tomato", price: 10 },
        { id: 2, name: "Burger", description: "Beef with salad", price: 12 },
      ],
    };
  },
  methods: {
    openModal() {
      this.$root.$emit("open-modal");
    },
  },
  mounted() {
    this.$root.$on("open-modal", this.openModal);
  },
  beforeUnmount() {
    this.$root.$off("open-modal", this.openModal);
  },
};
</script>

<style scoped>
button {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.menu-list {
  margin-top: 2rem;
}
</style>
