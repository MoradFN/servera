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
    <!-- <MenuSections v-if="!editMode" :sections="menuSections" /> -->
    <!-- Read-only sections otherwise -->
    <MenuSections v-else :sections="menuSections" />
  </div>

  <!-- Middle: Manage categories & items if editMode -->
  <div v-if="isOwner && editMode">
    <!-- ManageCategories modifies localCategories -->
    <ManageCategories
      :initialCategories="localCategories"
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
import { computed, ref, onMounted } from "vue";
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

    // Edit mode flags
    const editMode = ref(false);
    const changesMade = ref(false);

    // For sections editing
    const editableSections = ref([]);

    // Slug from the store
    const slug = computed(() => store.currentSlug);

    // Menu data from the store
    const menuData = computed(() => store.restaurantData?.menu || {});
    const menuSections = computed(() => menuData.value.sections || []);

    // Local copies for categories & items
    const localCategories = ref([]);
    const localItems = ref([]);

    // Initialize local arrays ONCE in onMounted (or whenever the slug changes)
    onMounted(() => {
      // Clone store sections
      editableSections.value = JSON.parse(JSON.stringify(menuSections.value));

      // Clone categories
      localCategories.value = JSON.parse(
        JSON.stringify(menuData.value.categories || [])
      );

      // Clone items
      localItems.value = JSON.parse(JSON.stringify(menuData.value.items || []));
    });

    // Flatten categories for the item dropdown
    const allCategoriesFlat = computed(() => {
      const result = [];
      function traverse(cats) {
        cats.forEach((cat) => {
          result.push(cat);
          if (cat.children?.length) traverse(cat.children);
        });
      }
      traverse(localCategories.value);
      return result;
    });

    // Build categoryId -> array of items map
    const categorizedItems = computed(() => {
      const mapping = {};
      function mapCat(cat) {
        mapping[cat.id] = localItems.value.filter(
          (item) => item.category_id === cat.id
        );
        if (cat.children) cat.children.forEach(mapCat);
      }
      localCategories.value.forEach(mapCat);
      return mapping;
    });

    // Toggles edit mode
    function toggleEditMode() {
      editMode.value = !editMode.value;
    }

    // Mark changes
    function onInputChange() {
      changesMade.value = true;
    }

    // Save both sections + categories + items in one go
    async function saveAllChanges() {
      try {
        // 1) update sections
        await store.updateSections(slug.value, "menu", editableSections.value);

        // 2) update categories + items
        await store.updateMenuData(
          slug.value,
          localCategories.value,
          localItems.value
        );

        changesMade.value = false;
        editMode.value = false;
        alert("All changes saved successfully!");
      } catch (err) {
        console.error("Failed to save all changes:", err.message);
      }
    }

    // Called when ManageCategories emits categoriesChanged
    function onCategoriesChanged(updatedCategories) {
      localCategories.value = updatedCategories;
      changesMade.value = true;
    }

    // Called when ManageItems emits itemsChanged
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
