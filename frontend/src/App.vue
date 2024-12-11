<!-- MTTODO TRANSITION TEST, LÄGG DE NÅN ANNAN STANS. -->
<script setup>
import { RouterView, useRoute } from "vue-router";
import Navbar from "@/components/Navbar.vue";
import RestaurantNavbar from "@/components/RestaurantNavbar.vue";

const route = useRoute();
const isPublicPage = ["/", "/about", "/get-started", "/login", "/register"];
const isRestaurantPage = route.params.slug !== undefined;
</script>
<template>
  <div id="app">
    <!-- <Navbar /> -->
    <Navbar v-if="isPublicPage.includes(route.path)" />
    <!-- <RestaurantNavbar v-else-if="isRestaurantPage" /> -->
    <RouterView />
  </div>
</template>

<!-- <style>
/* Transitions for smoother navigation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> -->
