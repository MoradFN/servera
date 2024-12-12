<template>
  <nav class="navbar">
    <router-link :to="`/${slug}`">Home</router-link>
    <router-link :to="`/${slug}/about`">About Us</router-link>
    <router-link :to="`/${slug}/menu`">Menu</router-link>
    <router-link :to="`/${slug}/admin`">Admin</router-link>
    <button @click="logout">Logout</button>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const slug = route.params.slug;

const logout = () => {
  // Clear auth token and navigate to login
  document.cookie = "authToken=; Max-Age=0";
  router.push("/login");
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-around;
  padding: 1rem;
  background: #2c3e50;
  color: white;
}
a,
button {
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
