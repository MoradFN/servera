<template>
  <div class="restaurant-layout">
    <!-- Pass restaurant data and auth info to NavBar -->
    <RestaurantNavBar
      :restaurantData="restaurantData"
      :isAuthenticated="isAuthenticated"
      :isOwner="isOwner"
      :hasSubscription="hasSubscription"
    />

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
import RestaurantNavBar from "@/components/restaurant/RestaurantNavBar.vue";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useAuthStore } from "@/stores/authStore";
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

export default {
  components: { RestaurantNavBar, Footer },
  setup() {
    const route = useRoute();
    const restaurantStore = useRestaurantStore();
    const authStore = useAuthStore();
    const slug = computed(() => route.params.slug);

    // Computed properties for auth statuses
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const isOwner = computed(() => authStore.isOwner);
    const hasSubscription = computed(() => authStore.hasSubscription);

    // Fetch required data on mount
    onMounted(async () => {
      try {
        // Fetch restaurant data
        await restaurantStore.fetchRestaurantData(slug.value);

        // Check auth statuses
        await authStore.fetchAuthStatus();
        await authStore.checkOwnership(slug.value);
        await authStore.checkSubscription();
      } catch (error) {
        console.error("Error initializing layout:", error.message);
      }
    });

    return {
      slug,
      restaurantData: restaurantStore.restaurantData,
      isAuthenticated,
      isOwner,
      hasSubscription,
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
