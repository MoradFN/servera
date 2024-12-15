<template>
  <div>
    <h2>Subscribe</h2>

    <!-- Display fetched restaurant/user data -->
    <div v-if="restaurantData">
      <p>
        <strong>{{ restaurantData.name || "Name unavailable" }}</strong>
      </p>
      <p>{{ restaurantData.email || "Email unavailable" }}</p>
      <p>Restaurant Slug: {{ restaurantData.slug || "Slug unavailable" }}</p>
    </div>

    <form @submit.prevent="createSubscription">
      <div id="card-element">
        <!-- Stripe Card Element will be mounted here -->
      </div>

      <button type="submit" :disabled="isLoading">
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

<style scoped></style>
