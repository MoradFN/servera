<template>
  <div class="edit-layout">
    <!-- Sidebar for editing -->
    <div class="editor">
      <h1>Edit {{ pageLabel }}</h1>
      <textarea
        v-model="content"
        placeholder="Enter content here..."
      ></textarea>
      <button @click="savePage">Save</button>
    </div>

    <!-- Live Preview -->
    <div class="preview">
      <h1>Preview {{ pageLabel }}</h1>
      <div class="preview-content">
        <div v-for="section in previewSections" :key="section.section_order">
          <h1 v-if="section.section_type === 'title'">{{ section.content }}</h1>
          <p v-else-if="section.section_type === 'text'">
            {{ section.content }}
          </p>
          <img
            v-else-if="section.section_type === 'image'"
            :src="section.content"
            alt="Image Content"
          />
          <p v-else>Unsupported section type: {{ section.section_type }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useRestaurantStore } from "@/stores/restaurantStore";

// Extract route parameters
const route = useRoute();
const slug = route.params.slug;
const page = route.params.page;

// Determine the page label
const pageLabel = computed(() => {
  switch (page) {
    case "home":
      return "Home Page";
    case "about":
      return "About Page";
    case "menu":
      return "Menu Page";
    default:
      return "Page";
  }
});

// Load the current content
const store = useRestaurantStore();
const currentSections = store.restaurantData[page]?.sections || [];
const content = ref(currentSections[0]?.content || "");

// Dynamically update preview
const previewSections = computed(() => [
  { section_type: "text", content: content.value },
]);

// Save the updated content
async function savePage() {
  const data = { sections: previewSections.value };
  await store.savePage(page, data);
  alert(`${pageLabel.value} saved successfully!`);
}
</script>

<style scoped>
.edit-layout {
  display: flex;
  gap: 2rem;
}

.editor {
  width: 40%;
}

textarea {
  width: 100%;
  height: 200px;
  margin: 1rem 0;
}

button {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.preview {
  width: 60%;
  background-color: #f9f9f9;
  padding: 1rem;
  border: 1px solid #ddd;
}

.preview-content {
  padding: 1rem;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
