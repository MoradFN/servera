<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRoute } from "vue-router";

// Define props to accept restaurant data
const props = defineProps({
  restaurantData: {
    type: Object,
    required: true,
  },
});

const route = useRoute();
const authStore = useAuthStore();

// Extract slug
const slug = route.params.slug;

// Define available pages dynamically
const availablePages = computed(() => {
  const pages = [];
  if (props.restaurantData?.home) {
    pages.push({ name: "Home", path: `/${slug}` });
  }
  if (props.restaurantData?.about) {
    pages.push({ name: "About", path: `/${slug}/about` });
  }
  if (props.restaurantData?.menu) {
    pages.push({ name: "Menu", path: `/${slug}/menu` });
  }
  return pages;
});

// Determine active link
const isActiveLink = (routePath) => route.path === routePath;

// Check if the user owns this restaurant
const isOwner = computed(
  () => authStore.user?.id === props.restaurantData?.ownerId
);
</script>

<template>
  <nav class="restaurant-nav">
    <!-- Dynamic Navigation Links -->
    <div v-for="page in availablePages" :key="page.path">
      <router-link :to="page.path" :class="{ active: isActiveLink(page.path) }">
        {{ page.name }}
      </router-link>
    </div>

    <!-- Owner Links (if user is logged in and owns the restaurant) -->
    <li v-if="isOwner">
      <router-link :to="{ path: `/${slug}/admin` }">Dashboard</router-link>
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
