import axios from "./axios";

export async function isAuthenticated() {
  try {
    const response = await axios.get("/auth/is-authenticated");
    return response.data.success ? response.data.user : null;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
}

// // authService.js
// export function hasAuthToken() {
//   return document.cookie.includes("authToken"); // Check token presence
// }

// // Skip API call if no token
// async function checkAuthIfNeeded() {
//   if (!hasAuthToken()) return null;
//   const response = await axios.get("/auth/is-authenticated");
//   return response.data.success ? response.data.user : null;
// }
