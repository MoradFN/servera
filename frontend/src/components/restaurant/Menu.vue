<template>
  <!-- Top: Manage Sections if isOwner -->
  <div>
    <div v-if="isOwner" class="owner-controls">
      <button @click="toggleEditMode">
        {{ editMode ? "Disable Edit Mode" : "Enable Edit Mode" }}
      </button>

      <transition v-if="editMode" name="slide-fade">
        <div v-if="changesMade" class="save-changes-bar">
          <!-- Single "Save All" button for both categories & items -->
          <button @click="saveAllChanges">Save All Changes</button>
        </div>
      </transition>
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
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";

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

    // Edit/changes flags
    const editMode = ref(false);
    const changesMade = ref(false);

    // For sections
    const editableSections = ref([]);

    // Slug from store
    const slug = computed(() => store.currentSlug);
    const menuData = computed(() => store.restaurantData.menu || {});
    const menuSections = computed(() => menuData.value.sections || []);

    // localCategories & localItems arrays
    const localCategories = ref([]);
    const localItems = ref([]);

    onMounted(() => {
      // Clone sections
      editableSections.value = JSON.parse(JSON.stringify(menuSections.value));
      // Clone categories
      localCategories.value = JSON.parse(
        JSON.stringify(menuData.value.categories || [])
      );
      // Clone items
      localItems.value = JSON.parse(JSON.stringify(menuData.value.items || []));
    });

    // Flatten categories so new categories appear immediately
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

    // Build categoryId->items map for read-only display
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

    // Toggles edit mode
    function toggleEditMode() {
      editMode.value = !editMode.value;
    }

    // Called when editing sections
    function onInputChange() {
      changesMade.value = true;
    }

    // Save both sections + categories + items
    async function saveAllChanges() {
      try {
        // 1) Save sections
        await store.updateSections(slug.value, "menu", editableSections.value);

        // 2) Save categories/items
        await store.updateMenuData(
          slug.value,
          localCategories.value,
          localItems.value
        );

        changesMade.value = false;
        editMode.value = false;
        alert("All changes saved successfully!");
      } catch (error) {
        console.error("Failed to save all changes:", error.message);
      }
    }

    // If child categories changed => changesMade = true
    function onCategoriesChanged() {
      changesMade.value = true;
    }

    // If child items changed => update localItems => changesMade = true
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
.save-changes-bar {
  background-color: #007bff;
  color: white;
  text-align: center;
  padding: 10px;
  margin-top: 10px;
}
</style>
