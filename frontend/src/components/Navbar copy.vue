<template>
  <nav class="navbar">
    <div class="nav-container">
      <RouterLink to="/" class="logo">🍕 MyApp</RouterLink>

      <ul class="nav-links">
        <template v-if="isPublicPage">
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/about">About</RouterLink></li>
          <li><RouterLink to="/get-started">Get Started</RouterLink></li>
          <li><RouterLink to="/login">Login</RouterLink></li>
          <li><RouterLink to="/register">Register</RouterLink></li>
        </template>

        <template v-else-if="isRestaurantOwner">
          <li><RouterLink :to="`/${restaurantSlug}`">Dashboard</RouterLink></li>
          <li>
            <RouterLink :to="`/${restaurantSlug}/menu`">Manage Menu</RouterLink>
          </li>
          <li>
            <RouterLink :to="`/${restaurantSlug}/about`"
              >Manage About</RouterLink
            >
          </li>
          <li>
            <RouterLink :to="`/${restaurantSlug}/admin`">Admin</RouterLink>
          </li>
          <li><button @click="logout">Logout</button></li>
        </template>

        <template v-else>
          <li><RouterLink to="/">Visit Restaurants</RouterLink></li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, computed } from "vue";

// Simulate user authentication (replace this with Vuex or Pinia)
const isLoggedIn = ref(true);
const restaurantSlug = ref("italian-palace");

const route = useRoute();
const router = useRouter();

// Determine if on public page
const isPublicPage = computed(() => {
  const publicPages = ["/", "/about", "/get-started", "/login", "/register"];
  return publicPages.includes(route.path);
});

// Check if logged in as a restaurant owner
const isRestaurantOwner = computed(
  () => isLoggedIn.value && restaurantSlug.value
);

// Logout method
const logout = () => {
  isLoggedIn.value = false;
  router.push("/login");
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ff6347;
  padding: 1rem 2rem;
  color: white;
}

.nav-container {
  display: flex;
  align-items: center;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1rem;
}

.nav-links li {
  margin: 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}
</style>
