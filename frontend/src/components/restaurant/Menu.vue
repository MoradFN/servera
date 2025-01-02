<template>
  <!-- Top area: sections editing if owner -->
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

    <!-- Show EditableSections if edit mode is ON -->
    <EditableSections
      v-if="isOwner && editMode"
      v-model="editableSections"
      :editMode="editMode"
      @change="onInputChange"
    />

    <!-- Show read-only sections if edit mode is OFF -->
    <MenuSections v-if="!editMode" :sections="menuSections" />
  </div>

  <!-- Middle: Manage categories if edit mode -->
  <div v-if="isOwner && editMode">
    <ManageCategories
      :initialCategories="menuCategories"
      :slug="slug"
      @categoriesUpdated="onCategoriesUpdated"
    />
  </div>

  <!-- Middle: Manage items if edit mode -->
  <div v-if="isOwner && editMode">
    <ManageItems
      :initialItems="menuItems"
      :categories="menuCategories"
      :slug="slug"
      @itemsUpdated="onItemsUpdated"
    />
  </div>

  <!-- Bottom: Always show read-only category->items tree -->
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

    // For sections
    const editMode = ref(false);
    const changesMade = ref(false);
    const editableSections = ref([]);

    // Data from store
    const slug = computed(() => store.currentSlug);
    const menuData = computed(() => store.restaurantData?.menu || {});
    const menuSections = computed(() => menuData.value.sections || []);
    const menuCategories = computed(() => menuData.value.categories || []);
    const menuItems = computed(() => menuData.value.items || []);

    // Keep local copy of "sections" for drag
    watchEffect(() => {
      editableSections.value = JSON.parse(JSON.stringify(menuSections.value));
    });

    // Build categoryId -> array of items
    const categorizedItems = computed(() => {
      const mapping = {};

      function mapItems(cat) {
        mapping[cat.id] = menuItems.value.filter(
          (item) => item.category_id === cat.id
        );
        (cat.children || []).forEach(mapItems);
      }
      menuCategories.value.forEach(mapItems);
      return mapping;
    });

    // Toggle edit mode
    function toggleEditMode() {
      editMode.value = !editMode.value;
    }

    function onInputChange() {
      changesMade.value = true;
    }

    // Save the updated sections
    async function saveSections() {
      try {
        await store.updateSections(slug.value, "menu", editableSections.value);
        changesMade.value = false;
        editMode.value = false;
        alert("Sections updated successfully!");
      } catch (error) {
        console.error("Failed to save sections:", error.message);
      }
    }

    // Called when ManageCategories emits categoriesUpdated
    function onCategoriesUpdated(updatedCategories) {
      store.restaurantData.menu.categories = updatedCategories;
      console.log("Updated Categories in parent:", updatedCategories);
    }

    // Called when ManageItems emits itemsUpdated
    function onItemsUpdated(updatedItems) {
      store.restaurantData.menu.items = updatedItems;
      console.log("Updated Items in parent:", updatedItems);
    }

    return {
      // State
      editMode,
      changesMade,
      editableSections,

      // Data from store
      slug,
      menuSections,
      menuCategories,
      menuItems,
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
