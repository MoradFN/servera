<script setup>
import { useToast } from "vue-toastification";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const toast = useToast();
const router = useRouter();
const slug = ref("");
const restaurantName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const fullSlug = computed(() => {
  return `www.servera.com/${slug.value.toLowerCase()}`;
});

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await axios.post(
      "http://localhost:8083/api/auth/register",
      {
        slug: slug.value,
        name: restaurantName.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
      }
    );

    // Handle success response
    if (response.data.success) {
      toast.success("Registration successful! Redirecting to login...");
      router.push("/login");
    } else {
      // Fallback if success is false
      toast.error(response.data.message || "Something went wrong");
    }
  } catch (err) {
    // Handle error response from the backend
    if (err.response && err.response.data) {
      const backendErrors = err.response.data.errors || [];
      // Display each error as a toast notification
      backendErrors.forEach((error) => {
        toast.error(error.message);
      });
    } else {
      // Handle other errors (e.g., network issues)
      toast.error("A network error occurred. Please try again later.");
    }

    console.error("Registration Error:", err);
  }
};
</script>

<template>
  <div class="registration-form">
    <form @submit="handleSubmit" class="form-container">
      <label class="form-label">
        Registrera Subdomän:<br />
        <p class="full-slug-prefix">Länk till din restaurang:</p>
        <span class="full-slug">{{ fullSlug }}</span>
        <input type="text" v-model="slug" class="form-input" />
      </label>
      <label class="form-label">
        Namn på din restaurang
        <input type="text" v-model="restaurantName" class="form-input" />
      </label>
      <label class="form-label">
        Mail address
        <input type="email" v-model="email" class="form-input" />
      </label>
      <label class="form-label">
        Lösenord
        <input type="password" v-model="password" class="form-input" />
      </label>
      <label class="form-label">
        Verifiera lösenord
        <input type="password" v-model="confirmPassword" class="form-input" />
      </label>
      <button type="submit" class="submit-button">Sign up</button>
    </form>
    <p class="alternative-option">or</p>
    <router-link to="/login" class="login-link">Log in</router-link>
  </div>
</template>

<style scoped>
.registration-form {
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

.full-slug-prefix {
  font-size: 0.8rem;
  opacity: 0.5;
}

.full-slug {
  font-size: 0.8rem;
  font-weight: bold;
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

.alternative-option {
  margin-top: 1rem;
  text-align: center;
}

.login-link {
  color: #007bff;
  text-decoration: underline;
  display: block;
  text-align: center;
  margin-top: 0.5rem;
}
</style>
