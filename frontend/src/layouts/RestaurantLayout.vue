<template>
  <div class="restaurant-layout">
    <!-- Pass restaurant data to NavBar -->
    <RestaurantNavBar :restaurantData="restaurantData" />

    <!-- Hero Section -->
    <section class="hero">
      <slot name="hero">
        <h1>{{ restaurantData?.home[0]?.content || "Welcome!" }}</h1>
      </slot>
    </section>

    <!-- Main Content -->
    <main>
      <slot :restaurantData="restaurantData" />
      <router-view :restaurantData="restaurantData" />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Footer from "@/components/Footer.vue";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import RestaurantNavBar from "@/components/restaurant/RestaurantNavBar.vue";

export default {
  components: { RestaurantNavBar, Footer },
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
