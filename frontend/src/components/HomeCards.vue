<script setup>
import HomeCard from "./HomeCard.vue";

// Sample Images (Replace with actual image paths)
const cards = [
  {
    title: "Custom Menus",
    description: "Create menus tailored to your restaurant's theme.",
    linkText: "See Examples",
    linkHref: "/menus",
    imageSrc: new URL(
      "@/assets/img/placeholder-menu-example-1.png",
      import.meta.url
    ).href,
    bg: "bg-white",
  },
  {
    title: "Unique Themes",
    description: "Design a theme that matches your brand perfectly.",
    linkText: "View Themes",
    linkHref: "/themes",
    imageSrc: new URL(
      "@/assets/img/placeholder-menu-example-2.png",
      import.meta.url
    ).href,
    bg: "bg-gray-100",
  },
  {
    title: "Menu Management",
    description: "Easily manage menu items and promotions.",
    linkText: "Manage Now",
    linkHref: "/admin",
    imageSrc: new URL(
      "@/assets/img/placeholder-menu-example-3.png",
      import.meta.url
    ).href,
    bg: "bg-green-100",
  },
];
</script>

<template>
  <section class="py-4">
    <div class="container-xl lg:container m-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-lg">
        <HomeCard
          v-for="(card, index) in cards"
          :key="index"
          :bg="card.bg"
          :imageSrc="card.imageSrc"
          :altText="card.title"
        >
          <h2 class="text-2xl font-bold">{{ card.title }}</h2>
          <p class="mt-2 mb-4">{{ card.description }}</p>
          <a
            :href="card.linkHref"
            class="inline-block bg-black text-white rounded-lg px-4 py-2 hover:bg-gray-700"
          >
            {{ card.linkText }}
          </a>
        </HomeCard>
      </div>
    </div>
  </section>
</template>
