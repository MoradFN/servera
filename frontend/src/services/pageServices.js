import axios from "./axios";

// export const createPage = async (slug, pageData) => {
//   try {
//     const response = await axios.post(`/pages/${slug}`, pageData);
//     return response.data; // Expect { success: true/false, message, data }
//   } catch (error) {
//     console.error(
//       "Error creating page:",
//       error.response?.data || error.message
//     );
//     throw (
//       error.response?.data ||
//       new Error("An error occurred during page creation.")
//     );
//   }
// };

export const createPage = async (slug, pageData) => {
  try {
    console.log("Sending request to create page...");
    const response = await axios.post(`/pages/${slug}`, pageData);
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating page:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("An error occurred.");
  }
};
