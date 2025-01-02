<template>
  <div class="about-page-container">
    <!-- If the about page is found, render the content -->
    <div v-if="pageIsFound">
      <!-- Page Title -->
      <!-- <h2 class="page-title">About Page</h2> -->

      <!-- Edit Mode Toggle -->
      <div v-if="isOwner" class="owner-controls">
        <button @click="toggleEditMode" class="edit-mode-button">
          <i class="pi pi-file-edit"></i>
          <span>{{ editMode ? " Edit Mode" : "Preview" }}</span>
        </button>
        <transition v-if="editMode" name="slide-fade">
          <!-- Save Changes Button only visible if changesMade -->
          <div v-if="changesMade" class="save-changes-bar">
            <button @click="saveSections">Save Changes</button>
          </div>
        </transition>
      </div>

      <!-- Editable Sections with Drag-and-Drop -->
      <draggable
        v-model="editableSections"
        @end="onDragEnd"
        class="draggable-list"
        handle=".drag-handle"
      >
        <div
          v-for="section in editableSections"
          :key="section.id || section.section_order"
          class="editable-section"
          :class="{ dashed: editMode }"
        >
          <!-- Drag Handle and Section Type Selector -->
          <div v-if="editMode" class="section-controls">
            <span class="drag-handle">☰</span>
            <select v-model="section.section_type" @change="onInputChange">
              <option value="title">Title</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
            <button class="remove-button" @click="removeSection(section)">
              Remove
            </button>
          </div>

          <!-- Editable Content using input or textarea -->
          <template v-if="editMode">
            <div v-if="section.section_type === 'title'">
              <input
                v-model="section.content"
                placeholder="Enter title content"
                class="input"
                @input="onInputChange"
              />
            </div>
            <div v-else-if="section.section_type === 'text'">
              <textarea
                v-model="section.content"
                placeholder="Enter text content"
                class="textarea"
                @input="onInputChange"
              ></textarea>
            </div>
            <div v-else-if="section.section_type === 'image'">
              <input
                v-model="section.content"
                placeholder="Enter image URL"
                class="input"
                @input="onInputChange"
              />
            </div>
          </template>

          <!-- Read-Only Content -->
          <template v-else>
            <component :is="getSectionTag(section.section_type)">
              {{ section.content }}
            </component>
          </template>
        </div>
      </draggable>

      <!-- Add Section Button -->
      <div v-if="editMode" class="add-section-container">
        <button class="add-section-button" @click="addSection">
          Add Section
        </button>
      </div>
    </div>

    <!-- If about page is missing -->
    <div v-else class="missing-page-message">
      <p v-if="isOwner">
        This page doesn't exist yet. You can create it in the Admin Dashboard.
      </p>
      <p v-else>404 - Page not found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useToast } from "vue-toastification";

const draggable = VueDraggableNext;
const toast = useToast();

const props = defineProps({
  restaurantData: { type: Object, required: true },
  pageStatus: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
});

const restaurantStore = useRestaurantStore();
const editMode = ref(false);
const changesMade = ref(false);

// Editable sections (clone the initial data for editing)
const editableSections = ref([...(props.restaurantData?.about || [])]);

const pageIsFound = computed(() => props.pageStatus.about === "found");

// Toggles edit mode
const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

// Sets changesMade to true on any user interaction
const onInputChange = () => {
  changesMade.value = true;
};

// Adds a new section
const addSection = () => {
  editableSections.value.push({
    id: null,
    section_order: editableSections.value.length + 1,
    section_type: "text",
    content: "",
  });
  changesMade.value = true;
};

// Removes a section
const removeSection = (section) => {
  const index = editableSections.value.indexOf(section);
  if (index !== -1) editableSections.value.splice(index, 1);
  changesMade.value = true;
};

// Handles drag-and-drop reordering
const onDragEnd = () => {
  editableSections.value.forEach((section, index) => {
    section.section_order = index + 1;
  });
  changesMade.value = true;
};

// Saves the updated sections
const saveSections = async () => {
  try {
    const slug = restaurantStore.currentSlug;
    const pageName = "about";
    await restaurantStore.updateSections(
      slug,
      pageName,
      editableSections.value
    );
    toast.success("Sections updated successfully!");
    changesMade.value = false; // Reset changes
    editMode.value = false; // Disable edit mode after save
  } catch (error) {
    console.error("Failed to update sections:", error.message);
    toast.error("Failed to update sections.");
  }
};

// Determines the correct HTML tag for the section type
const getSectionTag = (sectionType) => {
  switch (sectionType) {
    case "title":
      return "h2";
    case "text":
      return "p";
    case "image":
      return "img";
    default:
      return "div";
  }
};
</script>

<style scoped>
/* Edit Mode Button */
.edit-mode-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

/* Editable Sections */
.editable-section {
  padding: 10px;
  margin-bottom: 10px;
  position: relative;
}

.editable-section.dashed {
  border: 1px dashed #007bff;
  border-radius: 4px;
}

/* Section Controls */
.section-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

/* Text Styles */
.editable-section h2,
.editable-section p {
  text-align: center;
}

.editable-section h2 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.editable-section p {
  font-size: 1.5rem;
  color: #555;
  margin-bottom: 10px;
}

.drag-handle {
  cursor: grab;
}

/* Content Styles */
.input,
.textarea {
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.read-only-content {
  display: inline-block;
  width: 100%;
}

/* Sticky Save Changes Bar */
.save-changes-bar {
  position: sticky;
  top: -50px;
  background-color: #007bff;
  color: white;
  text-align: center;
  padding: 10px;
  z-index: 10;
  transition: top 0.3s ease-in-out;
}
.save-changes-bar.visible {
  top: 0;
}

/* Remove Button */
.remove-button {
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

/* Draggable List */
.draggable-list {
  margin-bottom: 20px;
}

/* Owner Controls */
.owner-controls {
  margin-bottom: 20px;
}

/* Add Section Button */
.add-section-container {
  text-align: center;
  margin-top: 10px;
}
.add-section-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.add-section-button:hover {
  background-color: #218838;
}

/* Transition Effects */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
