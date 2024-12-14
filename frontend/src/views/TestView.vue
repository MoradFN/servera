<template>
  <div>
    <h2>Create Test Stripe Customer</h2>
    <form @submit.prevent="createCustomer">
      <div class="form-group">
        <label for="email">Email:</label>
        <input id="email" v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label for="name">Name:</label>
        <input id="name" v-model="name" type="text" required />
      </div>
      <button type="submit">Create Customer</button>
    </form>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="customer">
      <h3>Customer Created:</h3>
      <p>ID: {{ customer.id }}</p>
      <p>Email: {{ customer.email }}</p>
      <p>Name: {{ customer.name }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const email = ref("");
const name = ref("");
const customer = ref(null);
const errorMessage = ref(null);

const createCustomer = async () => {
  errorMessage.value = null;
  try {
    const response = await axios.post(
      "http://localhost:8083/api/test/create-customer",
      {
        email: email.value,
        name: name.value,
      },
      {
        withCredentials: true,
      }
    );
    customer.value = response.data.customer;
  } catch (err) {
    console.error(err);
    errorMessage.value =
      err.response?.data?.message || "Failed to create customer.";
  }
};
</script>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
}
</style>
