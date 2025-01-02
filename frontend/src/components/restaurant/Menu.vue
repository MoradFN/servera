<template>
  <!-- This top area handles sections editing (like before) -->
  <div>
    <!-- Editable Sections -->
    <div v-if="isOwner">
      <div class="owner-controls">
        <button @click="toggleEditMode">
          {{ editMode ? "Disable Edit Mode" : "Enable Edit Mode" }}
        </button>
        <transition v-if="editMode" name="slide-fade">
          <div v-if="changesMade" class="save-changes-bar">
            <button @click="saveSections">Save Changes</button>
          </div>
        </transition>
      </div>

      <!-- Render EditableSections only in edit mode -->
      <EditableSections
        v-if="editMode"
        v-model="editableSections"
        :editMode="editMode"
        @change="onInputChange"
      />
    </div>

    <!-- Render MenuSections only in view mode -->
    <MenuSections v-if="!editMode" :sections="menuSections" />
  </div>

  <!-- 
    ManageCategories for categories+items.
    We pass initialCategories and initialItems from the store,
    so the child doesn't get "undefined".
  -->
  <div v-if="isOwner && editMode">
    <ManageCategories
      :initialCategories="menuCategories"
      :initialItems="menuItems"
      :slug="slug"
      @categoriesUpdated="onCategoriesUpdated"
      @itemsUpdated="onItemsUpdated"
    />
  </div>

  <!-- Always display the read-only category tree -->
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
    isOwner: {
      type: Boolean,
      required: true,
    },
    restaurantData: {
      type: Object,
      required: true,
    },
    pageStatus: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const store = useRestaurantStore();

    // Local state for editing "sections"
    const editMode = ref(false);
    const changesMade = ref(false);
    const editableSections = ref([]);

    // Pull data from the store
    const slug = computed(() => store.currentSlug);

    // The "menu" object from the store
    const menuData = computed(() => store.restaurantData?.menu || {});
    // Grab arrays from that
    const menuSections = computed(() => menuData.value.sections || []);
    const menuCategories = computed(() => menuData.value.categories || []);
    const menuItems = computed(() => menuData.value.items || []);

    // Keep a local copy of "sections" for drag-and-drop
    watchEffect(() => {
      editableSections.value = JSON.parse(JSON.stringify(menuSections.value));
    });

    // Build a map: categoryId -> array of items
    const categorizedItems = computed(() => {
      const mapping = {};

      const mapItemsToCategory = (cat) => {
        // items for this category
        mapping[cat.id] = menuItems.value.filter(
          (item) => item.category_id === cat.id
        );
        // map children recursively
        if (cat.children) {
          cat.children.forEach((child) => mapItemsToCategory(child));
        }
      };

      menuCategories.value.forEach((cat) => {
        mapItemsToCategory(cat);
      });
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
        await store.updateSections(slug.value, "menu", editableSections.value);
        changesMade.value = false;
        editMode.value = false;
        alert("Sections updated successfully!");
      } catch (error) {
        console.error("Failed to save sections:", error.message);
      }
    }

    function onCategoriesUpdated(updatedCategories) {
      // The child ManageCategories emits updated categories
      store.restaurantData.menu.categories = updatedCategories;
      console.log("Updated Categories in parent:", updatedCategories);
    }

    function onItemsUpdated(updatedItems) {
      // If you want to track updated items
      store.restaurantData.menu.items = updatedItems;
      console.log("Updated Items in parent:", updatedItems);
    }

    return {
      editMode,
      changesMade,
      editableSections,
      toggleEditMode,
      onInputChange,
      saveSections,

      // For the rest of the template
      slug,
      menuSections,
      menuCategories,
      menuItems, // <-- Now we return it so the template sees it
      categorizedItems,

      // Events
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
