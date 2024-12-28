<template>
  <div>
    <!-- Render all sections dynamically from restaurantData -->
    <div v-for="section in aboutPage" :key="section.section_order">
      <h1 v-if="section.section_type === 'title'">{{ section.content }}</h1>
      <p v-else-if="section.section_type === 'text'">{{ section.content }}</p>
      <img
        v-else-if="section.section_type === 'image'"
        :src="section.content"
        alt="Image Content"
      />
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

// Access the "about" page data from restaurantData
const aboutPage = computed(() => props.restaurantData?.about || []);
</script>
