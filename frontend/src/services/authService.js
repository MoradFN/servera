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
