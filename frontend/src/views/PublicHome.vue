<script setup>
import { ref, onMounted } from "vue";
import TheWelcome from "../components/TheWelcome.vue";

const apiData = ref(null);

onMounted(async () => {
  try {
    // Use the environment variable for the API base URL
    const API_URL = import.meta.env.VITE_API_BASE_URL;
    const response = await fetch(`${API_URL}/api/test`);

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    apiData.value = await response.json();
  } catch (error) {
    console.error("Failed to fetch API data:", error);
    apiData.value = { success: false, data: [] }; // Fallback in case of failure
  }
});
</script>

<template>
  <main>
    <TheWelcome />
    <div v-if="apiData && apiData.success">
      <p>Success: {{ apiData.success }}</p>
      <ul>
        <li v-for="item in apiData.data" :key="item.id">
          {{ item.name }} - {{ item.email }} - {{ item.subscription_status }}
        </li>
      </ul>
    </div>
    <p v-else-if="apiData">No data available.</p>
    <p v-else>Loading...</p>
  </main>
</template>
