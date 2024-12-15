<template>
  <div>
    <h2>Subscribe</h2>

    <!-- Display fetched restaurant/user data -->
    <div v-if="restaurantData">
      <p>
        <strong>{{ restaurantData.name }}</strong>
      </p>
      <p>{{ restaurantData.email }}</p>
      <p>Restaurant Slug: {{ restaurantData.slug }}</p>
    </div>

    <form @submit.prevent="createSubscription">
      <div id="card-element">
        <!-- Stripe Card Element will be mounted here -->
      </div>
      <button type="submit">Subscribe</button>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { loadStripe } from "@stripe/stripe-js";

const stripeInstance = ref(null);
const elements = ref(null);
let cardElement = null;

const restaurantData = ref(null); // To store fetched restaurant/user data

onMounted(async () => {
  // Fetch the restaurant (user) data
  try {
    const res = await fetch(
      "http://localhost:8083/api/restaurants/restaurantdata",
      {
        credentials: "include", // ensures authToken cookie is sent
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

  // Initialize Stripe
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
  // Create a PaymentMethod from the card element
  const { paymentMethod, error } =
    await stripeInstance.value.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        // Optionally include billing details here, for example from restaurantData:
        // MTTODO: CHECK IT OUT.
        name: restaurantData.value ? restaurantData.value.name : undefined,
        email: restaurantData.value ? restaurantData.value.email : undefined,
      },
    });

  if (error) {
    console.error("Error creating payment method:", error);
    return;
  }

  // Send the paymentMethod.id and the planId to your backend
  try {
    const response = await fetch(
      "http://localhost:8083/api/subscriptions/subscribe",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // so authToken cookie is sent
        body: JSON.stringify({
          planId: "price_1QSqYXGAJFpbqKlxqX1I7Qud", // your plan ID
          paymentMethodId: paymentMethod.id,
        }),
      }
    );
    const result = await response.json();
    if (result.success) {
      console.log("Subscription created successfully:", result.data);
    } else {
      console.error("Failed to create subscription:", result.message);
    }
  } catch (err) {
    console.error("Error calling backend:", err);
  }
}
</script>

<style scoped>
/* Add some basic styling if needed */
</style>
