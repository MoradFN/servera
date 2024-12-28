<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useRoute } from "vue-router";

const route = useRoute();
const authStore = useAuthStore();
const restaurantStore = useRestaurantStore();

// Extract dynamic data
const restaurantName = computed(
  () => restaurantStore.restaurantData?.home[0]?.content || "Restaurant"
);
const slug = route.params.slug;

// Check if the user owns this restaurant
const isOwner = computed(() => authStore.user?.id === restaurantStore.ownerId);

// Define available pages dynamically
const availablePages = computed(() => {
  const pages = [];
  if (restaurantStore.restaurantData?.home) {
    pages.push({ name: "Home", path: `/${slug}` });
  }
  if (restaurantStore.restaurantData?.about) {
    pages.push({ name: "About", path: `/${slug}/about` });
  }
  if (restaurantStore.restaurantData?.menu) {
    pages.push({ name: "Menu", path: `/${slug}/menu` });
  }
  return pages;
});

// Determine active link
const isActiveLink = (routePath) => route.path === routePath;
</script>

<template>
  <nav class="restaurant-nav">
    <!-- Logo Image -->
    <!-- <img :src="logo" alt="App Logo" class="logo" /> -->

    <div v-for="page in availablePages" :key="page.path">
      <router-link :to="page.path" :class="{ active: isActiveLink(page.path) }">
        {{ page.name }}
      </router-link>
    </div>
    <!-- Owner Links (if user is logged in and owns the restaurant) -->
    <li v-if="isOwner">
      <router-link :to="{ path: `/${slug}/admin` }">Manage Home</router-link>
    </li>
  </nav>
</template>

<style scoped>
.restaurant-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 1rem;
  background: #2c3e50;
  color: white;
  max-height: 70px;
}

.logo {
  height: 50px;
  margin-right: 1rem;
}

a {
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  background: none;
  padding: 1rem 1rem;
}
a.active {
  background-color: #283142; /* Customize as needed */
  border-radius: 1rem;
}

a:hover {
  text-decoration: underline;
  background-color: #191e29;
  border-radius: 1rem 1rem;
}
</style>
