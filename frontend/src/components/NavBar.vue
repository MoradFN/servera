<template>
  <nav class="navbar">
    <!-- Logo Image -->
    <img :src="logo" alt="App Logo" class="logo" />

    <!-- Navigation Links -->
    <router-link to="/">Home</router-link>
    <router-link to="/about">About Us</router-link>
    <router-link to="/login">Login</router-link>
    <router-link to="/register">Register</router-link>
  </nav>
</template>

<script setup>
// Import logo image
import logo from "../assets/img/logo.png";
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 1rem;
  background: #2c3e50;
  color: white;
}

.logo {
  height: 50px;
  margin-right: 1rem;
}

a {
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
}
a:hover {
  text-decoration: underline;
}
</style>
