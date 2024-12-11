<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you are looking for doesn't exist.</p>
    <router-link to="/">Go Back Home</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 2rem;
}
h1 {
  font-size: 2.5rem;
  color: #ff6347;
}
p {
  font-size: 1.2rem;
}
a {
  color: #007bff;
  text-decoration: underline;
}
</style>
