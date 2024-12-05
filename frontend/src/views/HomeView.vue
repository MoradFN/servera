<script setup>
import { ref, onMounted } from "vue";
import TheWelcome from "../components/TheWelcome.vue";

const apiData = ref(null);

onMounted(async () => {
  const response = await fetch("http://localhost:3001/api/test");
  apiData.value = await response.json();
});
</script>

<template>
  <main>
    <TheWelcome />
    <div v-if="apiData">
      <p>Success: {{ apiData.success }}</p>
      <ul>
        <li v-for="item in apiData.data" :key="item.id">
          {{ item.name }} - {{ item.email }} - {{ item.subscription_status }}
        </li>
      </ul>
    </div>
    <p v-else>Loading...</p>
  </main>
</template>
