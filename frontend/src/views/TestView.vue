<template>
  <div>
    <h2>Subscribe</h2>
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

onMounted(async () => {
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
        // optionally include billing details like name, email, etc.
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
