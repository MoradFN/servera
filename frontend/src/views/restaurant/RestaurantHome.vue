<template>
  <div>
    <!-- If the home page is found, render the content -->
    <div v-if="pageIsFound">
      <div v-for="section in homePage" :key="section.section_order">
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

    <!-- If home page is missing, decide what to show -->
    <div v-else>
      <p v-if="isOwner">
        This page doesn't exist yet. You can create it in the Admin Dashboard.
      </p>
      <p v-else>404 - Page not found</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  restaurantData: { type: Object, required: true },
  pageStatus: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
});

const homePage = computed(() => props.restaurantData?.home || []);
const pageIsFound = computed(() => props.pageStatus.home === "found");
</script>
