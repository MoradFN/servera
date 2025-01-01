<template>
  <div>
    <!-- Loop through sections and render dynamically -->
    <div v-for="section in sections" :key="section.section_order">
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

<script>
export default {
  name: "MenuSections",
  props: {
    sections: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
h1,
p {
  margin: 0.5rem 0;
}
img {
  max-width: 100%;
  height: auto;
}
</style>
