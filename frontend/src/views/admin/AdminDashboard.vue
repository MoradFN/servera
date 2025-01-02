<template>
  <div v-if="!loading">
    <h1 class="title">Admin Dashboard</h1>

    <!-- Check Ownership -->
    <div v-if="!isAuthenticated || !isOwner">
      <p v-if="!isAuthenticated">
        Please log in to access the admin dashboard.
      </p>
      <p v-else>You are not authorized to manage this restaurant.</p>
    </div>

    <div v-else>
      <!-- Pages Status Section -->
      <div class="pages-status-container">
        <h2>Pages Status</h2>
        <div class="pages-status">
          <span
            v-for="(status, page) in pageStatus"
            :key="page"
            :class="{
              found: status === 'found',
              missing: status === 'missing',
            }"
            class="page-status"
          >
            {{ page.toUpperCase() }} - {{ status }}
          </span>
        </div>
      </div>

      <!-- Page Creation Forms -->
      <div class="forms-container">
        <div v-for="page in pages" :key="page.name" class="page-form-container">
          <!-- If page exists, show the button -->
          <button
            v-if="pageStatus[page.name] === 'found'"
            class="go-button"
            @click="goToPage(page.name)"
          >
            Go to {{ page.label }} Page
          </button>

          <!-- If page doesn't exist, show the form -->
          <form
            v-else
            @submit.prevent="submitPage(page.name)"
            class="create-page-form"
          >
            <h2>Create {{ page.label }} Page</h2>
            <label for="sections">Section</label>
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
              <button
                type="button"
                class="remove-button"
                @click="removeSection(page.name, index)"
              >
                Remove Section
              </button>
            </div>
            <div class="btn_form_gr_blue">
              <button
                type="button"
                class="add-button"
                @click="addSection(page.name)"
              >
                Add Section
              </button>
              <button type="submit" class="create-button">
                Create {{ page.label }} Page
              </button>
            </div>
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

    // Navigate to the page
    const goToPage = (pageName) => {
      const slug = authStore.user.slug;
      const routes = {
        home: `/${slug}`,
        about: `/${slug}/about`,
        menu: `/${slug}/menu`,
      };
      window.location.href = routes[pageName];
    };
    const logout = async () => {
      try {
        await axios.post(
          "http://localhost:8083/api/auth/logout",
          {},
          {
            withCredentials: true,
          }
        );
        router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
        alert("Failed to log out. Please try again.");
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
      logout,
      pages,
      sections,
      addSection,
      removeSection,
      submitPage,
      goToPage,
      isAuthenticated,
      isOwner,
      pageStatus,
      loading,
    };
  },
};
</script>

<style scoped>
.title {
  font-size: 2rem;
  margin-bottom: 50px;
  color: #333;
}

.title,
h2 {
  text-align: center;
}

.pages-status-container {
  text-align: center;
  margin-bottom: 20px;
}

.pages-status-container h2 {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: #333;
}

.pages-status {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.page-status {
  font-size: 1rem;
  font-weight: bold;
  padding: 5px 15px;
  border-radius: 4px;
}

.page-status.found {
  background-color: #d4edda; /* Green for found */
  color: #155724;
  border: 1px solid #c3e6cb;
}

.page-status.missing {
  background-color: #f8d7da; /* Red for missing */
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.forms-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.page-form-container {
  flex: 1;
  min-width: 300px;
}

.create-page-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.btn_form_gr_blue {
  display: flex;
  gap: 3vw;
}

.btn_form_gr_blue button {
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #fff;
  font-weight: bold;
}

.add-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.add-button:hover {
  background-color: #0056b3;
}

.remove-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.remove-button:hover {
  background-color: #c82333;
}

.create-button {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

.create-button:hover {
  background-color: #218838;
}

.section {
  margin-bottom: 15px;
  width: 100%;
}

.success {
  color: green;
  font-weight: bold;
}
.go-button {
  background-color: #28a745; /* Green */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  text-align: center;
}

.go-button:hover {
  background-color: #218838;
}

.error {
  color: red;
  font-weight: bold;
}
</style>
