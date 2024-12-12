// Vue Core
import { createApp } from "vue";
import { createPinia } from "pinia";

// Main App
import App from "./App.vue";

// Router
import router from "./router";

// Global CSS & Plugins
import "./assets/main.css";
import "primeicons/primeicons.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Create Vue App
const app = createApp(App);

// Use Plugins
app.use(createPinia());
app.use(router);
app.use(Toast);

// Mount App
app.mount("#app");
