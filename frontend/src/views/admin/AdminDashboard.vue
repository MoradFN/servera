<template>
  <div>
    <h1>Create Pages</h1>
    <form @submit.prevent="createPage">
      <label>
        Page Name:
        <input v-model="pageName" />
      </label>
      <button type="submit">Create Page</button>
    </form>
  </div>
</template>

<script>
import { useRestaurantStore } from "@/stores/restaurantStore";

export default {
  data() {
    return {
      pageName: "",
    };
  },
  methods: {
    async createPage() {
      const store = useRestaurantStore();
      await store.createPage(this.$route.params.slug, this.pageName);
    },
  },
};
</script>
