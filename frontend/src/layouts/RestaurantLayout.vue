<template>
  <div class="restaurant-layout">
    <NavBar />

    <!-- Main Content Area -->
    <main>
      <!-- Dynamic Hero Section -->
      <section class="hero">
        <slot name="hero"></slot>
      </section>

      <!-- Dynamic Content Area -->
      <section class="content">
        <slot />
      </section>
    </main>

    <Footer />
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";

export default {
  components: {
    NavBar,
    Footer,
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
  background: #f8f9fa;
  padding: 2rem;
  text-align: center;
}
.content {
  padding: 2rem;
}
</style>
