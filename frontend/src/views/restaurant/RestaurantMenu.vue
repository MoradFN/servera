<template>
  <div>
    <!-- If the menu page is found, render the content -->
    <div v-if="pageIsFound">
      <div v-if="isOwner" class="owner-controls">
        <button @click="toggleEditMode">
          {{ editMode ? "Disable Edit Mode" : "Enable Edit Mode" }}
        </button>
        <transition v-if="editMode" name="slide-fade">
          <div v-if="changesMade" class="save-changes-bar">
            <button @click="saveSections">Save Changes</button>
          </div>
        </transition>
        <EditableSections
          v-model="editableSections"
          :editMode="editMode"
          @update="updateEditableSections"
          @change="onInputChange"
        />
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
import EditableSections from "@/components/restaurant/menu/EditableSections.vue";
import { defineProps, defineEmits } from "vue";
import { useRestaurantStore } from "@/stores/restaurantStore";

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

// Categorized items mapping
const categorizedItems = computed(() => {
  if (!menuCategories.value || !menuItems.value) return {};
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

// Toggles edit mode
const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

// Sets changesMade to true on any user interaction
const onInputChange = () => {
  changesMade.value = true;
};

const updateEditableSections = (newSections) => {
  editableSections.value = newSections;
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
</script>
