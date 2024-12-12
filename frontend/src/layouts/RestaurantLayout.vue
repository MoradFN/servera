<template>
  <div class="restaurant-layout">
    <NavBar />

    <main>
      <section class="hero">
        <slot name="hero"></slot>
      </section>

      <section class="content">
        <slot />
      </section>

      <!-- Reusable Modal -->
      <AddMenuItemModal v-if="isModalVisible" @close="closeModal">
        <h2>Add Menu Item</h2>
        <p>Form for creating a new menu item goes here...</p>
      </AddMenuItemModal>
    </main>

    <Footer />
  </div>
</template>

<script>
import NavBar from "@/components/Navbar.vue";
import Footer from "@/components/Footer.vue";
import AddMenuItemModal from "@/components/AddMenuItemModal.vue";

export default {
  components: { NavBar, Footer, AddMenuItemModal },
  data() {
    return {
      isModalVisible: false,
    };
  },
  methods: {
    openModal() {
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
    },
  },
};
</script>

<style scoped>
.restaurant-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
  padding: 2rem;
}
.hero {
  background: lightblue;
  padding: 2rem;
  text-align: center;
}
.content {
  padding: 2rem;
}
</style>
