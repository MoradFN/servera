<template>
  <div>
    <!-- Render all sections dynamically -->
    <div v-for="section in homePage" :key="section.section_order">
      <h1 v-if="section.section_type === 'title'">{{ section.content }}</h1>
      <p v-else-if="section.section_type === 'text'">{{ section.content }}</p>
      <img
        v-else-if="section.section_type === 'image'"
        :src="section.content"
        alt="Image Content"
      />
      <!-- Add more section types here as needed -->
      <p v-else>Unsupported section type: {{ section.section_type }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

// Define props
const props = defineProps({
  restaurantData: {
    type: Object,
    required: true,
  },
});

// Compute the "home" page data
const homePage = computed(() => props.restaurantData?.home || []);
</script>
