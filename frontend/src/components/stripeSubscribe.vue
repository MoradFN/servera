<template>
  <div class="subscription-form">
    <h2>Subscribe to Our Plan</h2>
    <form @submit.prevent="redirect">
      <div class="form-group">
        <label>Plan:</label>
        <div class="plan-info">Basic Plan - $10/month</div>
      </div>

      <div class="form-group">
        <label>Card Details:</label>
        <div class="card-element-placeholder">[Card input goes here]</div>
      </div>

      <button type="submit">Subscribe</button>
    </form>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="success">{{ successMessage }}</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { loadStripe } from "@stripe/stripe-js";

const stripe = ref(null);
const errorMessage = ref(null);
const successMessage = ref(null);

// Replace this with a real Checkout Session ID from your backend.
const TEST_CHECKOUT_SESSION_ID = "cs_test_xxx1234567890";

onMounted(async () => {
  try {
    const stripeInstance = await loadStripe(
      import.meta.env.VITE_STRIPE_PUBLIC_KEY
    );
    if (!stripeInstance) {
      throw new Error("Failed to load Stripe");
    }
    stripe.value = stripeInstance;
    successMessage.value = "Stripe has been initialized successfully!";
  } catch (err) {
    console.error("Error loading Stripe:", err);
    errorMessage.value =
      "An error occurred while initializing Stripe. Please try again later.";
  }
});

async function redirect() {
  if (!stripe.value) {
    errorMessage.value = "Stripe not initialized.";
    return;
  }

  // Use an actual session ID obtained from your backend after creating a Checkout Session.
  const { error } = await stripe.value.redirectToCheckout({
    sessionId: TEST_CHECKOUT_SESSION_ID,
  });

  if (error) {
    errorMessage.value = error.message;
  }
}
</script>

<style scoped>
.subscription-form {
  max-width: 400px;
  margin: 40px auto;
  font-family: Arial, sans-serif;
}

.subscription-form h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}

.plan-info,
.card-element-placeholder,
button {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.plan-info {
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f5f5f5;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-element-placeholder {
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 40px;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

button {
  background: #0070f3;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #005bb5;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}
</style>
