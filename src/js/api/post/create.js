import { getCurrentUser } from "../../utilities/authGuard";
import { API_SOCIAL_POSTS } from "../constants";
import { headers } from "../headers";

/**
 * Creates a new post
 * @param {Object} postData - The post data
 * @param {string} postData.title - The post title
 * @param {string} postData.body - The post body content
 * @param {string[]} postData.tags - Array of tags
 * @param {Object} postData.media - Media object with url
 * @returns {Promise<Object>} - The created post data, errors, and status code
 */
export async function createPost({ title, body, tags = [], media = null }) {
  // Get user data from local storage or context
  const { accessToken } = getCurrentUser();

  // Validate inputs
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
    // Set up request headers
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

    const response = await fetch(API_SOCIAL_POSTS, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(postData)
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      data: null,
      errors: [{ message: 'Failed to create post', error }],
      statusCode: 500
    };
  }
}
