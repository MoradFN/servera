<template>
  <div class="menu-sections">
    <!-- Loop through sections and render dynamically -->
    <div
      v-for="section in sections"
      :key="section.section_order"
      class="section"
    >
      <h1 v-if="section.section_type === 'title'" class="section-title">
        {{ section.content }}
      </h1>
      <p v-else-if="section.section_type === 'text'" class="section-text">
        {{ section.content }}
      </p>
      <img
        v-else-if="section.section_type === 'image'"
        :src="section.content"
        alt="Image Content"
        class="section-image"
      />
      <p v-else class="section-unsupported">
        Unsupported section type: {{ section.section_type }}
      </p>
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
/* .menu-sections {
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
} */

.section {
  margin-bottom: 2rem;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
  text-transform: uppercase;
  /* border-bottom: 2px solid #007bff; */
  display: inline-block;
  padding-bottom: 0.5rem;
}

.section-text {
  font-size: 1.5rem;
  color: #555;
  line-height: 1.8;
  margin-bottom: 1rem;
}

.section-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section-unsupported {
  font-size: 1rem;
  color: #ff4d4d;
  background-color: #ffecec;
  padding: 0.5rem;
  border-radius: 4px;
}
</style>
