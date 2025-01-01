<script setup>
import Menu from "@/components/restaurant/Menu.vue";
import { defineProps } from "vue";

const props = defineProps({
  restaurantData: { type: Object, required: true },
  pageStatus: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
});
</script>

<template>
  <Menu
    :restaurantData="restaurantData"
    :pageStatus="pageStatus"
    :isOwner="isOwner"
  />
</template>
