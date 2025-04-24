import { getCurrentUser } from "../../utilities/authGuard";
import { API_SOCIAL_POSTS } from "../constants";
import { headers } from "../headers";

/**
 * Deletes a post by ID
 * @param {string} id - The ID of the post to delete
 * @returns {Promise<Object>} - The response data, errors, and status code
 */
export async function deletePost(id) {
  if (!id) {
    throw new Error('Post ID is required');
  }

  try {
    // Get user data from local storage or context
    const { accessToken } = getCurrentUser();

    const requestHeaders = headers();
    requestHeaders.append("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(`${API_SOCIAL_POSTS}/${id}`, {
      method: 'DELETE',
      headers: requestHeaders
    });

    // Handle 204 No Content response (successful deletion)
    if (response.status === 204) {
      return {
        data: null,
        errors: null,
        statusCode: 204
      };
    }

    // For other status codes, try to parse the JSON response
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting post:', error);
    return {
      data: null,
      errors: [{ message: 'Failed to delete post', error }],
      statusCode: 500
    };
  }
}
