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
      <p>Pages status:</p>
      <ul>
        <li v-for="(status, page) in pageStatus" :key="page">
          {{ page.toUpperCase() }} - {{ status }}
          <button v-if="status === 'missing'" @click="createThatPage(page)">
            Create {{ page }} page
          </button>
        </li>
      </ul>

      <!-- Page Creation Forms -->
      <div class="forms-container">
        <div v-for="page in pages" :key="page.name" class="page-form-container">
          <form
            @submit.prevent="submitPage(page.name)"
            class="create-page-form"
          >
            <h2>Create {{ page.label }} Page</h2>
            <label for="sections">Typ av sektion:</label>
            <div
              v-for="(section, index) in sections[page.name]"
              :key="index"
              class="section"
            >
              <select v-model="section.section_type" required>
                <option value="title">Title</option>
                <option value="text">Text</option>
              </select>
              <input
                v-model="section.content"
                placeholder="Ange sektionsinnehåll"
                required
              />
              <input
                v-model.number="section.section_order"
                type="number"
                min="1"
                placeholder="Order"
                required
              />
              <button type="button" @click="removeSection(page.name, index)">
                Remove Section
              </button>
            </div>
            <button type="button" @click="addSection(page.name)">
              Add Section
            </button>
            <button type="submit">Create {{ page.label }} Page</button>
          </form>
          <p
            v-if="page.message"
            :class="{ success: page.isSuccess, error: !page.isSuccess }"
          >
            {{ page.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRestaurantStore } from "@/stores/restaurantStore";

export default {
  setup() {
    const authStore = useAuthStore();
    const restaurantStore = useRestaurantStore();

    // Page configurations for Home, About, and Menu
    const pages = ref([
      { name: "home", label: "Home", message: "", isSuccess: false },
      { name: "about", label: "About", message: "", isSuccess: false },
      { name: "menu", label: "Menu", message: "", isSuccess: false },
    ]);

    // Sections for each page
    const sections = ref({
      home: [{ section_type: "title", content: "", section_order: 1 }],
      about: [{ section_type: "title", content: "", section_order: 1 }],
      menu: [{ section_type: "title", content: "", section_order: 1 }],
    });

    const loading = ref(true);
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const isOwner = computed(() => authStore.isOwner);
    const pageStatus = computed(() => restaurantStore.pageStatus);

    // Add a new section to the specified page
    const addSection = (page) => {
      sections.value[page].push({
        section_type: "text",
        content: "",
        section_order: sections.value[page].length + 1,
      });
    };

    // Remove a section from the specified page
    const removeSection = (page, index) => {
      sections.value[page].splice(index, 1);
    };

    // Submit a page
    const submitPage = async (pageName) => {
      const pageConfig = pages.value.find((page) => page.name === pageName);

      try {
        const pageData = {
          name: pageName,
          sections: sections.value[pageName].map((section, index) => ({
            section_type: section.section_type,
            content: section.content,
            section_order: index + 1,
          })),
        };

        const response = await restaurantStore.createPage(
          authStore.user.slug,
          pageData
        );

        pageConfig.isSuccess = response.success;
        pageConfig.message = response.message;

        if (response.success) {
          sections.value[pageName] = [
            { section_type: "title", content: "", section_order: 1 },
          ];
        }
      } catch (error) {
        pageConfig.isSuccess = false;
        pageConfig.message = error.message;
      }
    };

    // Fetch authentication and ownership status on mount
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
      pages,
      sections,
      addSection,
      removeSection,
      submitPage,
      isAuthenticated,
      isOwner,
      pageStatus,
      loading,
    };
  },
};
</script>

<style scoped>
.forms-container {
  display: flex;
  gap: 20px; /* Add spacing between forms */
  flex-wrap: wrap; /* Allow forms to wrap on smaller screens */
}

.page-form-container {
  flex: 1; /* Make forms take equal space */
  min-width: 300px; /* Set a minimum width for each form */
}

.create-page-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center; /* Center-aligns the form content */
}

.create-page-form h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

.create-page-form label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
  width: 100%;
}

.create-page-form input,
.create-page-form select {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.create-page-form button {
  padding: 10px 20px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.create-page-form button:hover {
  background-color: #0056b3;
}

.section {
  margin-bottom: 15px;
  width: 100%;
}

.success {
  color: green;
  font-weight: bold;
}

.error {
  color: red;
  font-weight: bold;
}
</style>
