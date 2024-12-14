<template>
  <div class="subscription-form">
    <h2>Subscribe to Our Plan</h2>
    <form>
      <div class="form-group">
        <label>Plan:</label>
        <!-- A single, fixed subscription plan. If you have a name or price, you can customize it here. -->
        <div class="plan-info">Basic Plan - $10/month</div>
      </div>

      <div class="form-group">
        <label>Card Details:</label>
        <!-- Placeholder for card details (e.g., Stripe Elements) -->
        <div class="card-element-placeholder">[Card input goes here]</div>
      </div>

      <button type="submit">Subscribe</button>
    </form>
  </div>
</template>

<script setup>
// No functionality required, just a form structure
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
</style>
