import axios from "./axios";

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

export const updatePageSections = async (slug, pageName, sections) => {
  try {
    const response = await axios.put(`/pages/${slug}/${pageName}/sections`, {
      sections,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating page sections:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Failed to update sections.");
  }
};
