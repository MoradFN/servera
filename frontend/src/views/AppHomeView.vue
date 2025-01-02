<script setup>
import TheWelcome from "../components/TheWelcome.vue";
import AppHero from "@/components/AppHero.vue";
import HomeCards from "@/components/HomeCards.vue";
import RestaurantListings from "@/components/RestaurantListings.vue";
</script>

<template>
  <main>
    <!-- title="Home Prop Test title"
    subtitle="Home Prop Test subtitle" -->
    <AppHero
      :links="[
        { text: 'Kom igång', to: '/get-started' },
        { text: 'Läs mer', to: '/about' },
      ]"
    />
    <HomeCards />
    <RestaurantListings :limit="4" :showButton="true" />
    <!-- <TheWelcome /> -->
  </main>
</template>
