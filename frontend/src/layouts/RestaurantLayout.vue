<template>
  <div class="restaurant-layout">
    <!-- Navigation Bar -->
    <NavBar
      :restaurantName="restaurantData?.home[0]?.content || 'Restaurant'"
    />

    <!-- Hero Section -->
    <section class="hero">
      <slot name="hero">
        <h1>{{ restaurantData?.home[0]?.content || "Welcome!" }}</h1>
      </slot>
    </section>

    <!-- Main Content -->
    <main>
      <!-- Pass restaurantData to child routes via slot -->
      <slot :restaurantData="restaurantData" />
      <router-view :restaurantData="restaurantData" />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

export default {
  components: { NavBar, Footer },
  setup() {
    const route = useRoute();
    const restaurantStore = useRestaurantStore();
    const slug = computed(() => route.params.slug);

    // Fetch restaurant data when the component is mounted
    onMounted(async () => {
      try {
        await restaurantStore.fetchRestaurantData(slug.value);
      } catch (error) {
        console.error("Failed to fetch restaurant data:", error.message);
      }
    });

    return {
      slug,
      restaurantData: restaurantStore.restaurantData,
    };
  },
};
</script>

<style scoped>
.restaurant-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.hero {
  background: lightblue;
  text-align: center;
  padding: 2rem;
}
main {
  flex: 1;
  padding: 2rem;
}
</style>
