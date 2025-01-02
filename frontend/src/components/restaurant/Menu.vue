<template>
  <div>
    <!-- Top: Manage Sections if isOwner -->
    <div>
      <div v-if="isOwner" class="owner-controls">
        <button @click="toggleEditMode" class="edit-mode-button">
          <i class="pi pi-file-edit"></i>
          <span>{{ editMode ? " Close Edit" : "Edit page" }}</span>
        </button>

        <!-- Save Changes Bar -->
        <transition v-if="editMode" name="slide-fade">
          <div v-if="changesMade" class="save-changes-bar">
            <button @click="saveAllChanges">Save All Changes</button>
          </div>
        </transition>
      </div>

      <!-- Preview Indicator and Reverse Button -->
      <div v-if="changesMade" class="preview-indicator-container">
        <div v-if="!editMode" class="preview-indicator">
          <h2>Preview</h2>
        </div>
        <button @click="refreshPage" class="reverse-button">Reverse</button>
      </div>

      <!-- EditableSections if editMode -->
      <EditableSections
        v-if="editMode"
        v-model="editableSections"
        :editMode="editMode"
        @change="onInputChange"
      />

      <!-- Read-only sections otherwise -->
      <MenuSections v-else :sections="menuSections" />
    </div>

    <!-- Middle: Manage categories & items if editMode -->
    <div v-if="isOwner && editMode">
      <!-- ManageCategories modifies localCategories -->
      <ManageCategories
        :categories="localCategories"
        :allCategoriesFlat="allCategoriesFlat"
        :slug="slug"
        :level="0"
        @categoriesChanged="onCategoriesChanged"
      />

      <!-- ManageItems modifies localItems -->
      <ManageItems
        :initialItems="localItems"
        :allCategories="allCategoriesFlat"
        :slug="slug"
        @itemsChanged="onItemsChanged"
      />
    </div>

    <!-- Bottom: always show read-only category->items tree -->
    <MenuCategories
      :categories="localCategories"
      :categorizedItems="categorizedItems"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { useToast } from "vue-toastification";

import EditableSections from "@/components/restaurant/menu/EditableSections.vue";
import MenuSections from "@/components/restaurant/menu/MenuSections.vue";
import MenuCategories from "@/components/restaurant/menu/MenuCategories.vue";
import ManageCategories from "@/components/restaurant/menu/ManageCategories.vue";
import ManageItems from "@/components/restaurant/menu/ManageItems.vue";

export default {
  name: "Menu",
  components: {
    EditableSections,
    MenuSections,
    MenuCategories,
    ManageCategories,
    ManageItems,
  },
  props: {
    isOwner: { type: Boolean, required: true },
    restaurantData: { type: Object, required: true },
    pageStatus: { type: Object, required: true },
  },
  setup(props) {
    const store = useRestaurantStore();
    const toast = useToast();

    const editMode = ref(false);
    const changesMade = ref(false);

    const editableSections = ref([]);
    const slug = computed(() => store.currentSlug);
    const menuData = computed(() => store.restaurantData.menu || {});
    const menuSections = computed(() => menuData.value.sections || []);

    const localCategories = ref([]);
    const localItems = ref([]);

    onMounted(() => {
      editableSections.value = JSON.parse(JSON.stringify(menuSections.value));
      localCategories.value = JSON.parse(
        JSON.stringify(menuData.value.categories || [])
      );
      localItems.value = JSON.parse(JSON.stringify(menuData.value.items || []));
    });

    const allCategoriesFlat = computed(() => {
      const result = [];
      function traverse(catArr) {
        catArr.forEach((cat) => {
          result.push(cat);
          if (cat.children?.length) {
            traverse(cat.children);
          }
        });
      }
      traverse(localCategories.value);
      return result;
    });

    const categorizedItems = computed(() => {
      const mapping = {};
      function walk(cat) {
        mapping[cat.id] = localItems.value.filter(
          (item) => item.category_id === cat.id
        );
        (cat.children || []).forEach(walk);
      }
      localCategories.value.forEach(walk);
      return mapping;
    });

    function toggleEditMode() {
      editMode.value = !editMode.value;
    }

    function onInputChange() {
      changesMade.value = true;
    }

    async function saveAllChanges() {
      try {
        await store.updateSections(slug.value, "menu", editableSections.value);
        await store.updateMenuData(
          slug.value,
          localCategories.value,
          localItems.value
        );

        changesMade.value = false;
        editMode.value = false;
        toast.success("All changes saved successfully!");
      } catch (error) {
        console.error("Failed to save all changes:", error.message);
        toast.error("Failed to save all changes.");
      }
    }

    const refreshPage = () => {
      window.location.reload();
    };

    function onCategoriesChanged() {
      changesMade.value = true;
    }

    function onItemsChanged(updatedItems) {
      localItems.value = updatedItems;
      changesMade.value = true;
    }

    return {
      editMode,
      changesMade,
      editableSections,
      menuSections,
      localCategories,
      localItems,
      allCategoriesFlat,
      categorizedItems,
      slug,
      toggleEditMode,
      onInputChange,
      saveAllChanges,
      refreshPage,
      onCategoriesChanged,
      onItemsChanged,
    };
  },
};
</script>

<style scoped>
.owner-controls {
  margin-bottom: 20px;
}
.edit-mode-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
.preview-indicator-container {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1000;
}

.preview-indicator {
  background-color: #ffeb3b;
  color: #333;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeIn 0.5s ease-in-out;
}

.preview-indicator h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.reverse-button {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease;
}

.reverse-button:hover {
  background-color: #d32f2f;
}

/* Fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  margin-top: 30px;
  border-radius: 7px;
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
