<template>
  <div class="register-form">
    <h1>Register</h1>
    <form @submit.prevent="submitUser">
      <label for="name">Name</label>
      <input type="text" id="name" v-model="user.name" /><br />
      <label for="slug">Slug</label>
      <input type="text" id="slug" v-model="user.slug" /><br />
      <label for="email">Email</label>
      <input type="email" id="email" v-model="user.email" /><br />
      <label for="password">Password</label>
      <input type="password" id="password" v-model="user.password" /><br />
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const user = ref({
  name: "Test-hasdasdardcoded",
  slug: "hardcasdasdodeslug",
  email: "hardcoasdasdded@restaurant.se",
  password: "12345678",
});

function submitUser() {
  axios
    .post("http://localhost:8083/api/auth/register", user.value)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
}
</script>
