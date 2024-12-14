<template>
  <div>
    <h2>Subscribe</h2>
    <form @submit.prevent="subscribe">
      <div>
        <label>Plan ID:</label>
        <input :value="fixedPlanId" type="text" readonly />
      </div>

      <div>
        <label>Payment Method ID (optional if default card exists):</label>
        <input
          v-model="paymentMethodId"
          type="text"
          placeholder="Enter Payment Method ID"
        />
      </div>

      <button type="submit">Subscribe</button>
    </form>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const fixedPlanId = "price_1QSqYXGAJFpbqKlxqX1I7Qud"; // given plan ID

// We'll still keep planId as a ref in case we need it for logic, but it's set to fixedPlanId
const planId = ref(fixedPlanId);
const paymentMethodId = ref("");
const errorMessage = ref(null);
const successMessage = ref(null);

async function subscribe() {
  errorMessage.value = null;
  successMessage.value = null;

  try {
    const response = await axios.post(
      "http://localhost:8083/api/subscriptions/subscribe",
      {
        planId: planId.value,
        paymentMethodId: paymentMethodId.value || undefined,
      },
      {
        withCredentials: true,
      }
    );

    successMessage.value = response.data.message; // "Subscription created successfully"
    console.log("Subscription details:", response.data.data);
  } catch (err) {
    console.error(err);
    errorMessage.value =
      err.response?.data?.message || "Failed to create subscription.";
  }
}
</script>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
}
.success {
  color: green;
  margin-top: 10px;
}
</style>
