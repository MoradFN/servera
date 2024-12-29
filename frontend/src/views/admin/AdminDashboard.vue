<template>
  <div v-if="!loading">
    <h1>Admin Dashboard</h1>

    <!-- Check Ownership -->
    <div v-if="!isAuthenticated || !isOwner">
      <p v-if="!isAuthenticated">
        Please log in to access the admin dashboard.
      </p>
      <p v-else>You are not authorized to manage this restaurant.</p>
    </div>
    <div v-else>
      <!-- Page Creation Form -->
      <form @submit.prevent="submitPage" class="create-page-form">
        <label for="pageName">Page Name:</label>
        <select id="pageName" v-model="pageName" required>
          <option value="" disabled>Select a page</option>
          <option value="home">Home</option>
          <option value="about">About</option>
          <option value="menu">Menu</option>
        </select>

        <label for="sections">Sections:</label>
        <div v-for="(section, index) in sections" :key="index" class="section">
          <select v-model="section.section_type">
            <option value="title">Title</option>
            <option value="text">Text</option>
          </select>
          <input
            v-model="section.content"
            placeholder="Enter section content"
            required
          />
          <input
            v-model.number="section.section_order"
            type="number"
            min="1"
            placeholder="Order"
            required
          />
          <button type="button" @click="removeSection(index)">
            Remove Section
          </button>
        </div>
        <button type="button" @click="addSection">Add Section</button>
        <button type="submit">Create Page</button>
      </form>

      <!-- Feedback Message -->
      <p v-if="message" :class="{ success: isSuccess, error: !isSuccess }">
        {{ message }}
      </p>

      <!-- Existing Pages -->
      <div v-if="!hasPages">
        <p>No pages available. Create your first page above.</p>
      </div>
      <div v-else>
        <p>Befintliga sidor:</p>
        <ul>
          <li v-for="(page, index) in pages" :key="index">{{ page }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/authStore";
import { useRestaurantStore } from "@/stores/restaurantStore";
import { computed, ref, onMounted } from "vue";

export default {
  setup() {
    const authStore = useAuthStore();
    const restaurantStore = useRestaurantStore();

    // Reactive States
    const pageName = ref("");
    const sections = ref([
      { section_type: "title", content: "", section_order: 1 },
    ]);
    const message = ref("");
    const isSuccess = ref(false);
    const loading = ref(true);

    // Computed Properties
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const isOwner = computed(() => authStore.isOwner);
    const pages = computed(() =>
      Object.keys(restaurantStore.restaurantData).map(
        (key) => `${key.charAt(0).toUpperCase()}${key.slice(1)}`
      )
    );
    const hasPages = computed(() => pages.value.length > 0);

    // Add a new section
    const addSection = () => {
      sections.value.push({
        section_type: "text",
        content: "",
        section_order: sections.value.length + 1,
      });
    };

    // Remove a section
    const removeSection = (index) => {
      sections.value.splice(index, 1);
    };

    // Submit a new page
    const submitPage = async () => {
      try {
        if (!pageName.value) {
          message.value = "Please select a page name.";
          isSuccess.value = false;
          return;
        }

        const pageData = {
          name: pageName.value,
          sections: sections.value.map((section, index) => ({
            page_name: pageName.value,
            section_type: section.section_type,
            content: section.content,
            section_order: index + 1,
          })),
        };

        const response = await restaurantStore.createPage(
          authStore.user.slug,
          pageData
        );
        isSuccess.value = response.success;
        message.value = response.message;

        if (response.success) {
          pageName.value = "";
          sections.value = [
            { section_type: "title", content: "", section_order: 1 },
          ];
        }
      } catch (error) {
        isSuccess.value = false;
        message.value = error.message;
      }
    };

    // Fetch Auth Status and Ownership on Mount
    onMounted(async () => {
      try {
        await authStore.fetchAuthStatus();
        if (authStore.isAuthenticated) {
          await authStore.checkOwnership(authStore.user.slug);
        }
      } catch (error) {
        console.error("Error initializing admin dashboard:", error.message);
      } finally {
        loading.value = false;
      }
    });

    return {
      pageName,
      sections,
      addSection,
      removeSection,
      submitPage,
      message,
      isSuccess,
      pages,
      hasPages,
      isAuthenticated,
      isOwner,
      loading,
    };
  },
};
</script>

<style scoped>
.create-page-form {
  background-color: rgb(187, 180, 180);
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 4px;
}

.create-page-form label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.create-page-form input,
.create-page-form select {
  width: calc(100% - 12px);
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  color: #333;
}

.create-page-form input:focus,
.create-page-form select:focus {
  outline: none;
  border-color: #007bff;
}

.create-page-form button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-page-form button:hover {
  background-color: #0069d9;
}

.success {
  color: green;
  font-weight: bold;
  margin-top: 10px;
}

.error {
  color: red;
  font-weight: bold;
  margin-top: 10px;
}

.section {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  border: 1px solid #ddd;
}
</style>
