<script setup>
import TheWelcome from "../components/TheWelcome.vue";
import AppHero from "@/components/AppHero.vue";
</script>

<template>
  <main>
    <AppHero
      title="Test title"
      subtitle="Test subtitle"
      :links="[
        { text: 'Kom igång', to: '/get-started' },
        { text: 'Läs mer', to: '/about' },
      ]"
    />
    <TheWelcome />
  </main>
</template>
