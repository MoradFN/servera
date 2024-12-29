<template>
  <div class="dashboard">
    <h1>Admin Dashboard</h1>
    <p>Manage your restaurant's pages below:</p>
    <div class="actions">
      <router-link :to="{ name: 'EditPage', params: { slug, page: 'home' } }">
        Manage Home Page
      </router-link>
      <router-link :to="{ name: 'EditPage', params: { slug, page: 'about' } }">
        Manage About Page
      </router-link>
      <router-link :to="{ name: 'EditPage', params: { slug, page: 'menu' } }">
        Manage Menu Page
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";

// Extract the restaurant slug
const route = useRoute();
const slug = route.params.slug;
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

a {
  text-decoration: none;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
}
</style>
