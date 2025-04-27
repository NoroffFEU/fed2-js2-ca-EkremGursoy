// filepath: c:\Users\dacas\Documents\Classgap\Ekrem Gürsoy\fed2-js2-ca-EkremGursoy - v5 - 24-04-2025 - Ekrem\src\js\api\post\comment.js
import { getCurrentUser } from "../../utilities/authGuard";
import { API_SOCIAL_POSTS } from "../constants";
import { headers } from "../headers";

/**
 * Create a comment on a post
 * @param {string} postId - The ID of the post to comment on
 * @param {string} body - The comment body
 * @returns {Promise<Object>} - The created comment data, errors, and status code
 */
export async function createComment(postId, body) {
  if (!postId) {
    throw new Error('Post ID is required');
  }

  if (!body || typeof body !== 'string' || body.trim() === '') {
    throw new Error('Comment body is required and must be a non-empty string');
  }

  try {
    // Get user authentication token
    const { accessToken } = getCurrentUser();
    if (!accessToken) {
      return {
        data: null,
        errors: [{ message: 'Authentication required' }],
        statusCode: 401
      };
    }

    // Set up request headers
    const requestHeaders = headers();
    requestHeaders.append("Authorization", `Bearer ${accessToken}`);
    requestHeaders.append("Content-Type", "application/json");

    // Make the API request
    const response = await fetch(`${API_SOCIAL_POSTS}/${postId}/comment`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({ body })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating comment:', error);
    return {
      data: null,
      errors: [{ message: 'Failed to create comment', error }],
      statusCode: 500
    };
  }
}

/**
 * Get comments for a post
 * @param {string} postId - The ID of the post to get comments for
 * @returns {Promise<Object>} - The comments data, errors, and status code
 */
export async function getComments(postId) {
  if (!postId) {
    throw new Error('Post ID is required');
  }

  try {
    // Create URL with query parameters
    const url = new URL(`${API_SOCIAL_POSTS}/${postId}`);
    url.searchParams.append("_comments", true);
    url.searchParams.append("_author", true);

    // Set up request headers
    const requestHeaders = headers();
    const { accessToken } = getCurrentUser();
    if (accessToken) {
      requestHeaders.append("Authorization", `Bearer ${accessToken}`);
    }

    // Make the API request
    const response = await fetch(url, {
      headers: requestHeaders
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return {
      data: null,
      errors: [{ message: 'Failed to fetch comments', error }],
      statusCode: 500
    };
  }
}