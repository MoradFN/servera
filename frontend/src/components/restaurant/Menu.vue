<template>
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

  <!-- Remder and Use the ManageCategories component, if owner och if edit mode -->
  <div v-if="isOwner && editMode">
    <ManageCategories
      :initialCategories="menuCategories"
      :categorizedItems="categorizedItems"
      :slug="slug"
      @categoriesUpdated="onCategoriesUpdated"
    />
  </div>
  <div>
    <!-- Use the MenuCategories component -->
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
  },
  setup(props) {
    const store = useRestaurantStore();

    // State
    const editMode = ref(false);
    const changesMade = ref(false);
    const editableSections = ref([]);

    // Computed properties
    const slug = computed(() => store.currentSlug);
    const menuData = computed(() => store.restaurantData?.menu || {});
    const menuSections = computed(() => menuData.value.sections || []);
    const menuCategories = computed(() => menuData.value.categories || []);
    const menuItems = computed(() => menuData.value.items || []);

    // Dynamically synchronize editableSections
    watchEffect(() => {
      editableSections.value = JSON.parse(JSON.stringify(menuSections.value));
    });

    // Map categories to items, including parent and child categories
    const categorizedItems = computed(() => {
      const mapping = {};

      // Recursive function to map items to a category and its children
      const mapItemsToCategory = (category) => {
        // Map items to the current category
        mapping[category.id] = menuItems.value.filter(
          (item) => item.category_id === category.id
        );

        // If the category has children, map items for each child recursively
        category.children.forEach((child) => {
          mapItemsToCategory(child);
        });
      };

      // Map items for all top-level categories (including their children recursively)
      menuCategories.value.forEach((category) => {
        mapItemsToCategory(category);
      });

      return mapping;
    });

    // Methods
    const toggleEditMode = () => {
      editMode.value = !editMode.value;
    };

    const onInputChange = () => {
      changesMade.value = true;
    };

    const saveSections = async () => {
      try {
        await store.updateSections(slug.value, "menu", editableSections.value);
        changesMade.value = false;
        editMode.value = false;
        alert("Sections updated successfully!");
      } catch (error) {
        console.error("Failed to save sections:", error.message);
      }
    };

    const onCategoriesUpdated = (updatedCategories) => {
      console.log("Updated Categories:", updatedCategories);
      store.restaurantData.menu.categories = updatedCategories;
    };

    return {
      menuSections,
      menuCategories,
      categorizedItems,
      editMode,
      changesMade,
      editableSections,
      toggleEditMode,
      onInputChange,
      saveSections,
      onCategoriesUpdated,
      slug,
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
