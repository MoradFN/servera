<script setup>
import { useToast } from "vue-toastification";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const toast = useToast();
const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref(null);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      "http://localhost:8083/api/auth/login",
      {
        email: email.value,
        password: password.value,
      },
      {
        withCredentials: true,
      }
    );

    if (response.status === 200 && response.data.success) {
      const slug = response.data.data.restaurant.slug;
      toast.success("Login successful");
      router.push(`/${slug}/admin`);
    } else {
      toast.error("Something went wrong");
      error.value = "Something went wrong";
    }
  } catch (err) {
    console.error(err);
    toast.error("An error occurred during login.");
    error.value = "An error occurred during login.";
  }
};
</script>

<template>
  <div class="login-form">
    <form @submit="handleSubmit" class="form-container" autocomplete="on">
      <label class="form-label">
        E-post
        <input
          type="email"
          v-model="email"
          class="form-input"
          name="email"
          autocomplete="email"
          required
        />
      </label>
      <label class="form-label">
        Lösenord
        <input
          type="password"
          v-model="password"
          class="form-input"
          name="password"
          autocomplete="current-password"
          required
        />
      </label>
      <button type="submit" class="submit-button">Log in</button>
    </form>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<style scoped>
.login-form {
  max-width: 400px;
  margin: auto;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-container {
  display: flex;
  flex-direction: column;
}

.form-label {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-button {
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.submit-button:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
