<script setup>
import { defineProps } from "vue";

defineProps({
  bg: {
    type: String,
    default: "bg-gray-100",
  },
  imageSrc: {
    type: String,
    required: false,
  },
  altText: {
    type: String,
    default: "Image preview",
  },
});
</script>

<template>
  <div :class="`${bg} p-6 rounded-lg shadow-md`">
    <!-- Optional Image Display -->
    <img
      v-if="imageSrc"
      :src="imageSrc"
      :alt="altText"
      class="rounded-lg mb-4"
    />
    <slot></slot>
  </div>
</template>

<style scoped>
img {
  width: 100%;
  height: auto;
  object-fit: cover;
}
</style>
