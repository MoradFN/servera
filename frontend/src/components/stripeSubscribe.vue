<template>
  <div class="subscription-form">
    <h2 class="form-title">Subscribe</h2>

    <!-- Displayar innloggad restaurang data från eget api. -->
    <div v-if="restaurantData" class="restaurant-info">
      <p>
        <strong>{{ restaurantData.name || "Name unavailable" }}</strong>
      </p>
      <p>{{ restaurantData.email || "Email unavailable" }}</p>
      <p>Restaurant Slug: {{ restaurantData.slug || "Slug unavailable" }}</p>
    </div>

    <form @submit.prevent="createSubscription" class="form-container">
      <div id="card-element" class="card-element-placeholder">
        <!-- Stripe Card Element kommer att bli mountat HÄR! -->
      </div>

      <button type="submit" class="submit-button" :disabled="isLoading">
        {{ isLoading ? "Processing..." : "Subscribe" }}
      </button>
    </form>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import { useToast } from "vue-toastification";
import { useAuthStore } from "@/stores/authStore";

const stripeInstance = ref(null);
const elements = ref(null);
let cardElement = null;

const restaurantData = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
const toast = useToast();

onMounted(async () => {
  try {
    const res = await fetch(
      "http://localhost:8083/api/restaurants/restaurantdata",
      {
        credentials: "include",
      }
    );
    const result = await res.json();
    if (result.success) {
      restaurantData.value = result.data;
    } else {
      console.error("Failed to fetch user data:", result.message);
    }
  } catch (err) {
    console.error("Error fetching user data:", err);
  }

  stripeInstance.value = await loadStripe(
    import.meta.env.VITE_STRIPE_PUBLIC_KEY
  );
  elements.value = stripeInstance.value.elements();
  cardElement = elements.value.create("card", {
    style: { base: { fontSize: "16px" } },
  });
  cardElement.mount("#card-element");
});

async function createSubscription() {
  isLoading.value = true;
  errorMessage.value = ""; // Clear previous error
  const authStore = useAuthStore();

  try {
    // Create a PaymentMethod from the card element
    const { paymentMethod, error } =
      await stripeInstance.value.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

    if (error) {
      throw new Error("Payment method creation failed.");
    }

    // Send the paymentMethod.id and the planId to the backend
    const response = await fetch(
      "http://localhost:8083/api/subscriptions/subscribe",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          planId: "price_1QSqYXGAJFpbqKlxqX1I7Qud",
          paymentMethodId: paymentMethod.id,
        }),
      }
    );
    const result = await response.json();

    if (result.success) {
      // Update the subscription status in the store
      await authStore.refreshSubscriptionStatus();

      toast.success("Subscription created successfully! 🎉");
    } else {
      throw new Error(result.message || "Subscription failed.");
    }
  } catch (err) {
    errorMessage.value = err.message || "An error occurred while subscribing.";
    toast.error(errorMessage.value);
    console.error("Subscription Error:", err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.subscription-form {
  max-width: 500px;
  margin: auto;
  padding: 2rem;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.form-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.restaurant-info {
  background: #e8f4fc;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  text-align: left;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-element-placeholder {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 4px;
  background: white;
}

.submit-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-button:hover {
  background: #0056b3;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 1rem;
  font-weight: bold;
}
</style>
