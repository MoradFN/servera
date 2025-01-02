<template>
  <div class="restaurant-layout">
    <!-- Subscription Notification -->
    <div
      v-if="isAuthenticated && isOwner && !hasSubscription"
      class="subscription-notification"
    >
      <p>
        Subscribe to unlock premium features and manage your restaurant
        <button @click="router.push('/subscribe')" class="subscribe-button">
          Subscribe Now
        </button>
      </p>
    </div>
    <!-- styla -->
    <RestaurantNavBar
      :restaurantData="restaurantData"
      :isAuthenticated="isAuthenticated"
      :isOwner="isOwner"
      :hasSubscription="hasSubscription"
    />

    <!-- Example: Hero for 'home' page -->
    <section class="hero">
      <div v-if="pageStatus.home === 'found'">
        <!-- If the home page is found, display it -->
        <slot name="hero">
          <h1 v-if="restaurantData?.home?.[0]?.content">
            {{ restaurantData.home[0].content }}
          </h1>
        </slot>
      </div>

      <!-- If 'home' is missing -->
      <div v-else-if="pageStatus.home === 'missing'">
        <p v-if="isOwner">
          No home page yet. You can create it in the Admin Dashboard or inline
          edit mode.
        </p>
        <p v-else>404 - This page does not exist.</p>
      </div>
    </section>

    <main>
      <slot :restaurantData="restaurantData" :pageStatus="pageStatus" />
      <router-view
        :restaurantData="restaurantData"
        :pageStatus="pageStatus"
        :isOwner="isOwner"
      />
    </main>

    <Footer />
  </div>
</template>
<script>
import Footer from "@/components/Footer.vue";
import RestaurantNavBar from "@/components/restaurant/RestaurantNavBar.vue";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useAuthStore } from "@/stores/authStore";
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  components: { RestaurantNavBar, Footer },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const restaurantStore = useRestaurantStore();
    const authStore = useAuthStore();

    const slug = computed(() => route.params.slug);
    const pageStatus = computed(() => restaurantStore.pageStatus);

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const isOwner = computed(() => authStore.isOwner);
    const hasSubscription = computed(() => authStore.hasSubscription);

    // For example, show a "Create page" button or 404 fallback
    function isPageMissing(page) {
      return pageStatus.value[page] === "missing";
    }

    onMounted(async () => {
      try {
        await restaurantStore.fetchRestaurantData(slug.value);
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
      pageStatus,
      isAuthenticated,
      isOwner,
      hasSubscription,
      isPageMissing,
      router,
    };
  },
};
</script>

<style scoped>
.subscription-notification {
  background-color: #ffcc00;
  color: #000;
  text-align: center;
  padding: 10px;
  font-size: 1rem;
}

.subscribe-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 5px 10px;
  margin-left: 10px;
  cursor: pointer;
  border-radius: 4px;
}

.subscribe-button:hover {
  background-color: #0056b3;
}

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
