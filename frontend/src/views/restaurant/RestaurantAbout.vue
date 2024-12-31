<template>
  <div>
    <!-- If the about page is found, render the content -->
    <div v-if="pageIsFound">
      <!-- Edit Mode Toggle and Save Button -->
      <div v-if="isOwner" class="owner-controls">
        <button @click="toggleEditMode">
          {{ editMode ? "Disable Edit Mode" : "Enable Edit Mode" }}
        </button>
        <div
          v-if="editMode"
          class="save-changes-bar"
          :class="{ visible: changesMade }"
        >
          <button @click="saveSections">Save Changes</button>
        </div>
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
            <select v-model="section.section_type" @change="changesMade = true">
              <option value="title">Title</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
            </select>
            <button class="remove-button" @click="removeSection(section)">
              Remove
            </button>
          </div>

          <!-- Editable Content -->
          <component
            :is="getSectionTag(section.section_type)"
            contenteditable="true"
            :data-placeholder="`Edit ${section.section_type}`"
            @input="updateContent(section, $event)"
            class="editable-content"
          >
            {{ section.content }}
          </component>
        </div>
      </draggable>
    </div>

    <!-- If about page is missing -->
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
import { VueDraggableNext } from "vue-draggable-next";
import { useRestaurantStore } from "@/stores/restaurantStore";

const draggable = VueDraggableNext;

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

// Updates section content
const updateContent = (section, event) => {
  section.content = event.target.textContent;
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
    alert("Sections updated successfully!");
    changesMade.value = false;
  } catch (error) {
    console.error("Failed to update sections:", error.message);
    alert("Failed to update sections.");
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

.drag-handle {
  cursor: grab;
}

/* Content Styles */
.editable-content {
  outline: none;
  display: inline-block;
  width: 100%;
  padding: 5px;
}
.read-only-content {
  display: inline-block;
  width: 100%;
}

/* Sticky Save Changes Bar */
.save-changes-bar {
  position: sticky;
  top: 0;
  background-color: #007bff;
  color: white;
  text-align: center;
  padding: 10px;
  z-index: 10;
  display: none;
  transition: transform 0.3s ease-in-out;
}
.save-changes-bar.visible {
  display: block;
  transform: translateY(0);
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
</style>
