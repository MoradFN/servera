<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const slug = ref("");
const restaurantName = ref("");
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref(null);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slug: slug.value,
        restaurantName: restaurantName.value,
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
      }),
    });

    if (!response.ok) {
      error.value = "Something went wrong";
      return;
    }

    router.push("/login");
  } catch (error) {
    console.error(error);
    error.value = "Something went wrong";
  }
};
</script>

<template>
  <div class="registration-form">
    <form @submit="handleSubmit" class="form-container">
      <label class="form-label">
        Slug
        <input type="text" v-model="slug" class="form-input" />
      </label>
      <label class="form-label">
        Namn på din restaurang
        <input type="text" v-model="restaurantName" class="form-input" />
      </label>
      <label class="form-label">
        Förnamn
        <input type="text" v-model="firstName" class="form-input" />
      </label>
      <label class="form-label">
        Efternamn
        <input type="text" v-model="lastName" class="form-input" />
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
    <p v-if="error" class="error-message">{{ error }}</p>
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
