<script setup>
import { RouterLink } from "vue-router";
import { defineProps } from "vue";

defineProps({
  title: {
    type: String,
    default: "Become a Vue Dev",
  },
  subtitle: {
    type: String,
    default: "Find the Vue job that fits your skills and needs",
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
          Din Restaurang, Din Stil
        </h1>
        <p class="my-4 text-xl text-white">
          Anpassar din restaurang på dina vilkor <br />
          Skapa dina egna unika menyer och anpassade teman. <br />
          Ta kontroll över din restautang och effektivisera din verksamhet idag!
        </p>
      </div>
      <div class="heroNavWrapper">
        <nav>
          <RouterLink to="/get-started">[Kom igång]</RouterLink>
          <RouterLink to="/about">[Läs mer]</RouterLink>
        </nav>
      </div>
    </div>
  </section>
</template>
