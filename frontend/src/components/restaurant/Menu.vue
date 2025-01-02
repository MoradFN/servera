<template>
  <!-- 1) Top half: Edit "sections" if user is owner -->
  <div>
    <div v-if="isOwner" class="owner-controls">
      <button @click="toggleEditMode">
        {{ editMode ? "Disable Edit Mode" : "Enable Edit Mode" }}
      </button>
      <transition v-if="editMode" name="slide-fade">
        <div v-if="changesMade" class="save-changes-bar">
          <button @click="saveSections">Save Changes</button>
        </div>
      </transition>
    </div>

    <!-- Show EditableSections if editMode is ON -->
    <EditableSections
      v-if="isOwner && editMode"
      v-model="editableSections"
      :editMode="editMode"
      @change="onInputChange"
    />

    <!-- Show read-only sections if editMode is OFF -->
    <MenuSections v-if="!editMode" :sections="menuSections" />
  </div>

  <!-- 2) Middle: Manage categories/items if owner + edit mode -->
  <div v-if="isOwner && editMode">
    <ManageCategories
      :initialCategories="menuCategories"
      :initialItems="menuItems"
      :slug="slug"
      @categoriesUpdated="onCategoriesUpdated"
      @itemsUpdated="onItemsUpdated"
    />
  </div>

  <!-- 3) Bottom: Always show read-only categories/items -->
  <div>
    <MenuCategories
      :categories="menuCategories"
      :categorizedItems="categorizedItems"
    />
  </div>
</template>

<script>
import { computed, ref, watchEffect } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";

// Components
import EditableSections from "@/components/restaurant/menu/EditableSections.vue";
import MenuSections from "@/components/restaurant/menu/MenuSections.vue";
import MenuCategories from "@/components/restaurant/menu/MenuCategories.vue";
import ManageCategories from "@/components/restaurant/menu/ManageCategories.vue";

export default {
  name: "Menu",
  components: {
    EditableSections,
    MenuSections,
    MenuCategories,
    ManageCategories,
  },
  props: {
    isOwner: { type: Boolean, required: true },
    restaurantData: { type: Object, required: true },
    pageStatus: { type: Object, required: true },
  },
  setup(props) {
    const store = useRestaurantStore();

    // For editing "sections"
    const editMode = ref(false);
    const changesMade = ref(false);
    const editableSections = ref([]);

    // Grab data from the store
    const slug = computed(() => store.currentSlug);
    // "menu" object from the store
    const menuData = computed(() => store.restaurantData?.menu || {});

    // Extract arrays from the menu object
    const menuSections = computed(() => menuData.value.sections || []);
    const menuCategories = computed(() => menuData.value.categories || []);
    const menuItems = computed(() => menuData.value.items || []);

    // Keep a local copy of sections for drag-and-drop
    watchEffect(() => {
      // Clone them so we don't mutate store data directly
      editableSections.value = JSON.parse(JSON.stringify(menuSections.value));
    });

    // Build categoryId -> items array mapping
    const categorizedItems = computed(() => {
      const mapping = {};

      function mapItems(cat) {
        mapping[cat.id] = menuItems.value.filter(
          (item) => item.category_id === cat.id
        );
        if (cat.children) {
          cat.children.forEach((child) => mapItems(child));
        }
      }

      menuCategories.value.forEach((cat) => mapItems(cat));
      return mapping;
    });

    // Methods
    function toggleEditMode() {
      editMode.value = !editMode.value;
    }

    function onInputChange() {
      changesMade.value = true;
    }

    async function saveSections() {
      try {
        // Save the sections array to the store
        await store.updateSections(slug.value, "menu", editableSections.value);
        changesMade.value = false;
        editMode.value = false;
        alert("Sections updated successfully!");
      } catch (error) {
        console.error("Failed to save sections:", error.message);
      }
    }

    // Called when ManageCategories emits "categoriesUpdated"
    function onCategoriesUpdated(updatedCategories) {
      // Update store's categories
      store.restaurantData.menu.categories = updatedCategories;
      console.log("Updated Categories in parent:", updatedCategories);
    }

    // Called when ManageCategories emits "itemsUpdated"
    function onItemsUpdated(updatedItems) {
      // Update store's items
      store.restaurantData.menu.items = updatedItems;
      console.log("Updated Items in parent:", updatedItems);
    }

    return {
      // Refs & state
      editMode,
      changesMade,
      editableSections,

      // Computeds
      slug,
      menuSections,
      menuCategories,
      menuItems, // NB: We must return this so we can pass it to ManageCategories
      categorizedItems,

      // Methods
      toggleEditMode,
      onInputChange,
      saveSections,
      onCategoriesUpdated,
      onItemsUpdated,
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
