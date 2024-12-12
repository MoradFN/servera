<script setup>
import { RouterLink } from "vue-router";
import { defineProps } from "vue";

defineProps({
  title: {
    type: String,
    default: "Din Restaurang, Din Stil",
  },
  subtitle: {
    type: String,
    default: `
      Anpassa din restaurang på dina villkor <br />
      Skapa dina egna unika menyer och anpassade teman. <br />
      Ta kontroll över din restaurang och effektivisera din verksamhet idag!
    `,
  },
  links: {
    type: Array,
    default: () => [
      { text: "Kom igång", to: "/get-started" },
      { text: "Läs mer", to: "/about" },
    ],
  },
});
</script>

<template>
  <section class="bg-blue-400 py-20 mb-4">
    <div
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center"
    >
      <div class="text-center">
        <h1 class="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
          {{ title }}
        </h1>
        <p class="my-4 text-xl text-white" v-html="subtitle"></p>
      </div>

      <div class="heroNavWrapper">
        <nav>
          <RouterLink
            v-for="(link, index) in links"
            :key="index"
            :to="link.to"
            class="nav-link"
          >
            [{{ link.text }}]
          </RouterLink>
        </nav>
      </div>
    </div>
  </section>
</template>

<style scoped>
.heroNavWrapper nav {
  margin-top: 1rem;
}
.nav-link {
  margin: 0 0.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}
.nav-link:hover {
  text-decoration: underline;
}
</style>
