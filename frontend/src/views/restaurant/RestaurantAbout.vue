<template>
  <RestaurantLayout>
    <template #hero>
      <h1>About Us</h1>
      <p>Learn more about our story and passion for food.</p>
    </template>

    <template #default>
      <div class="about-content">
        <h2>{{ restaurant.name }}</h2>
        <p>{{ restaurant.description }}</p>
        <img :src="restaurant.image" alt="Restaurant Image" />
      </div>
    </template>
  </RestaurantLayout>
</template>

<script>
export default {
  data() {
    return {
      restaurant: {},
    };
  },
  async created() {
    const response = await fetch(`/api/restaurants/${this.$route.params.slug}`);
    this.restaurant = await response.json();
  },
};
</script>

<style scoped>
.about-content {
  text-align: center;
}
img {
  max-width: 100%;
  height: auto;
}
</style>
