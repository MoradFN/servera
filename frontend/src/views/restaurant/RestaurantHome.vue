<template>
  <div>
    <!-- If the home page is found, render the content -->
    <div v-if="pageIsFound">
      <!-- Enable drag-and-drop for owners -->
      <div v-if="isOwner">
        <h2>Edit Home Page</h2>
        <draggable v-model="editableSections" @end="onDragEnd">
          <div
            v-for="section in editableSections"
            :key="section.id || section.section_order"
            class="editable-section"
          >
            <div class="section-header">
              <span class="drag-handle">☰</span>
              <select v-model="section.section_type">
                <option value="title">Title</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>
              <button @click="removeSection(section)">Remove</button>
            </div>
            <div class="section-content">
              <template v-if="section.section_type === 'title'">
                <input
                  v-model="section.content"
                  placeholder="Enter title content"
                  class="input"
                />
              </template>
              <template v-else-if="section.section_type === 'text'">
                <textarea
                  v-model="section.content"
                  placeholder="Enter text content"
                  class="textarea"
                ></textarea>
              </template>
              <template v-else-if="section.section_type === 'image'">
                <input
                  type="text"
                  v-model="section.content"
                  placeholder="Enter image URL"
                  class="input"
                />
              </template>
              <template v-else>
                <p>Unsupported section type</p>
              </template>
            </div>
          </div>
        </draggable>
        <button class="add-section" @click="addSection">Add Section</button>
        <button class="save-sections" @click="saveSections">
          Save Changes
        </button>
      </div>

      <!-- Render non-editable sections for public view -->
      <div v-else>
        <div v-for="section in homePage" :key="section.section_order">
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
import { ref, computed } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { VueDraggableNext } from "vue-draggable-next";

const props = defineProps({
  restaurantData: { type: Object, required: true },
  pageStatus: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
});

const restaurantStore = useRestaurantStore();

// Editable sections (clone the initial data for editing)
const editableSections = ref([...(props.restaurantData?.home || [])]);

const homePage = computed(() => props.restaurantData?.home || []);
const pageIsFound = computed(() => props.pageStatus.home === "found");

// Add a new section
const addSection = () => {
  editableSections.value.push({
    id: null,
    section_order: editableSections.value.length + 1,
    section_type: "text",
    content: "",
  });
};

// Remove a section
const removeSection = (section) => {
  const index = editableSections.value.indexOf(section);
  if (index !== -1) editableSections.value.splice(index, 1);
};

// Update section order after drag-and-drop
const onDragEnd = () => {
  editableSections.value.forEach((section, index) => {
    section.section_order = index + 1;
  });
};

// Save changes to sections
const saveSections = async () => {
  try {
    const slug = restaurantStore.currentSlug;
    const pageName = "home"; // Use dynamic page name if needed
    await restaurantStore.updateSections(
      slug,
      pageName,
      editableSections.value
    );
    alert("Sections updated successfully!");
  } catch (error) {
    console.error("Failed to update sections:", error.message);
    alert("Failed to update sections.");
  }
};
</script>

<style scoped>
.editable-section {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  background-color: #f9f9f9;
}
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}
.drag-handle {
  cursor: grab;
}
.input,
.textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.add-section,
.save-sections {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.add-section:hover,
.save-sections:hover {
  background-color: #0056b3;
}
</style>
