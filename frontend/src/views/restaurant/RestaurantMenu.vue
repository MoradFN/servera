<template>
  <div>
    <!-- If the menu page is found, render the content -->
    <div v-if="pageIsFound">
      <!-- Edit Mode Toggle -->
      <div v-if="isOwner" class="owner-controls">
        <button @click="toggleEditMode">
          {{ editMode ? "Disable Edit Mode" : "Enable Edit Mode" }}
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

      <!-- Render categories and items recursively -->
      <div v-if="menuCategories.length > 0" class="menu-categories">
        <div
          v-for="category in menuCategories"
          :key="category.id"
          class="category"
        >
          <h2>{{ category.name }}</h2>
          <ul>
            <li v-for="item in categorizedItems[category.id]" :key="item.id">
              <strong>{{ item.name }}</strong>
              <span v-if="item.standard_price"
                >- ${{ item.standard_price }}</span
              >
              <span v-if="item.family_price"
                >(Family: ${{ item.family_price }})</span
              >

              <ul v-if="item.ingredients.length > 0">
                <li v-for="ingredient in item.ingredients" :key="ingredient.id">
                  - {{ ingredient.name }}
                </li>
              </ul>
            </li>
          </ul>

          <!-- Render child categories recursively -->
          <div v-if="category.children.length > 0" class="child-categories">
            <div
              v-for="child in category.children"
              :key="child.id"
              class="category"
            >
              <h3>{{ child.name }}</h3>
              <ul>
                <li v-for="item in categorizedItems[child.id]" :key="item.id">
                  <strong>{{ item.name }}</strong>
                  <span v-if="item.standard_price"
                    >- ${{ item.standard_price }}</span
                  >
                  <span v-if="item.family_price"
                    >(Family: ${{ item.family_price }})</span
                  >

                  <ul v-if="item.ingredients.length > 0">
                    <li
                      v-for="ingredient in item.ingredients"
                      :key="ingredient.id"
                    >
                      - {{ ingredient.name }}
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- No categories found -->
      <div v-else>
        <p>No menu categories or items available.</p>
      </div>
    </div>

    <!-- If the menu page is missing -->
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

// Editable sections
const editableSections = ref([...(props.restaurantData?.menu?.sections || [])]);
const menuCategories = computed(
  () => props.restaurantData.menu?.categories || []
);
const menuItems = computed(() => props.restaurantData.menu?.items || []);
const pageIsFound = computed(() => props.pageStatus.menu === "found");

// Toggles edit mode
const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

// Sets changesMade to true on any user interaction
const onInputChange = () => {
  changesMade.value = true;
};

// Add/Remove Section
const addSection = () => {
  editableSections.value.push({
    id: null,
    section_order: editableSections.value.length + 1,
    section_type: "text",
    content: "",
  });
  changesMade.value = true;
};

const removeSection = (section) => {
  editableSections.value = editableSections.value.filter((s) => s !== section);
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
    const pageName = "menu";
    await restaurantStore.updateSections(
      slug,
      pageName,
      editableSections.value
    );
    alert("Sections updated successfully!");
    changesMade.value = false; // Reset changes
    editMode.value = false; // Disable edit mode after save
  } catch (error) {
    console.error("Failed to update sections:", error.message);
    alert("Failed to update sections.");
  }
};

// Categorized items mapping
const categorizedItems = computed(() => {
  const mapping = {};
  menuCategories.value.forEach((category) => {
    mapping[category.id] = menuItems.value.filter(
      (item) => item.category_id === category.id
    );

    // Recursive mapping for child categories
    const mapChildItems = (childCategories) => {
      childCategories.forEach((child) => {
        mapping[child.id] = menuItems.value.filter(
          (item) => item.category_id === child.id
        );
        if (child.children && child.children.length > 0) {
          mapChildItems(child.children);
        }
      });
    };

    if (category.children && category.children.length > 0) {
      mapChildItems(category.children);
    }
  });
  return mapping;
});

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
