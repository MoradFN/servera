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
    <MenuSections v-if="!editMode" :sections="menuSections" />
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
import { computed, ref, watchEffect } from "vue";
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

    const editMode = ref(false);
    const changesMade = ref(false);

    // For sections editing
    const editableSections = ref([]);

    const slug = computed(() => store.currentSlug);
    // "menu" from store
    const menuData = computed(() => store.restaurantData?.menu || {});
    const menuSections = computed(() => menuData.value.sections || []);
    // Vi håller egen  copy av "localCategories" och "localItems" skcika i samma för att undvika omit.
    // in a single call to updateMenuData.
    const localCategories = ref([]);
    const localItems = ref([]);

    // Initialize local copies
    watchEffect(() => {
      // For sections
      editableSections.value = JSON.parse(JSON.stringify(menuSections.value));

      // For categories
      localCategories.value = JSON.parse(
        JSON.stringify(menuData.value.categories || [])
      );

      // For items
      localItems.value = JSON.parse(JSON.stringify(menuData.value.items || []));
    });

    // Whenever we do "flatten categories" for the dropdown in ManageItems
    // we can build a computed that returns all categories + children in one array
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

    // Build categoryId -> array of items map
    const categorizedItems = computed(() => {
      const mapping = {};
      function mapCat(cat) {
        mapping[cat.id] = localItems.value.filter(
          (item) => item.category_id === cat.id
        );
        (cat.children || []).forEach(mapCat);
      }
      localCategories.value.forEach(mapCat);
      return mapping;
    });

    function toggleEditMode() {
      editMode.value = !editMode.value;
    }

    function onInputChange() {
      changesMade.value = true;
    }

    // "Save All" merges sections + categories + items
    async function saveAllChanges() {
      try {
        // 1) Save sections
        await store.updateSections(slug.value, "menu", editableSections.value);

        // 2) Then update categories+items in one call
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

    // Child "ManageCategories" emits new categories
    function onCategoriesChanged(updatedCats) {
      localCategories.value = updatedCats;
      changesMade.value = true;
    }

    // Child "ManageItems" emits new items
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
