import { getCurrentUser } from "../../utilities/authGuard";
import { API_SOCIAL_POSTS } from "../constants";
import { headers } from "../headers";

/**
 * Updates an existing post
 * @param {string} id - The ID of the post to update
 * @param {Object} postData - The updated post data
 * @param {string} postData.title - The updated post title
 * @param {string} postData.body - The updated post body content
 * @param {string[]} postData.tags - Updated array of tags
 * @param {Object} postData.media - Updated media object with url
 * @returns {Promise<Object>} - The updated post data, errors, and status code
 */
export async function updatePost(id, { title, body, tags = [], media = null }) {
  // Get user data from local storage or context
  const { accessToken } = getCurrentUser();

  // Validate inputs
  if (!id) {
    throw new Error('Post ID is required');
  }

  if (!title || typeof title !== 'string') {
    throw new Error('Title is required and must be a string');
  }

  if (!body || typeof body !== 'string') {
    throw new Error('Body is required and must be a string');
  }

  if (!Array.isArray(tags)) {
    throw new Error('Tags must be an array');
  }

  try {
    const requestHeaders = headers();
    requestHeaders.append("Authorization", `Bearer ${accessToken}`);
    requestHeaders.append("Content-Type", "application/json");

    // Prepare post data
    const postData = {
      title,
      body,
      tags,
    };

    // Add media if provided
    if (media) {
      postData.media = media;
    }

    const response = await fetch(`${API_SOCIAL_POSTS}/${id}`, {
      method: 'PUT',
      headers: requestHeaders,
      body: JSON.stringify(postData)
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error('Error updating post:', error);
    return {
      data: null,
      errors: [{ message: 'Failed to update post', error }],
      statusCode: 500
    };
  }
}
