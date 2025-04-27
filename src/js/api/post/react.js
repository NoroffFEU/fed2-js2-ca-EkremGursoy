import { getCurrentUser } from "../../utilities/authGuard";
import { API_SOCIAL_POSTS } from "../constants";
import { headers } from "../headers";

/**
 * React to a post with an emoji (or toggle reaction if it already exists)
 * @param {string} postId - The ID of the post to react to
 * @param {string} symbol - The reaction emoji symbol (e.g., '👍', '❤️')
 * @returns {Promise<Object>} - The reaction data, errors, and status code
 */
export async function reactToPost(postId, symbol) {
  if (!postId) {
    throw new Error('Post ID is required');
  }

  if (!symbol || typeof symbol !== 'string') {
    throw new Error('Reaction symbol is required and must be a string');
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

    // Make the API request using PUT to toggle the reaction
    // According to the docs: "If the authenticated user has already reacted to the post 
    // with the provided symbol, the reaction will be removed. Otherwise, the reaction will be added."
    const response = await fetch(`${API_SOCIAL_POSTS}/${postId}/react/${encodeURIComponent(symbol)}`, {
      method: 'PUT',
      headers: requestHeaders
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error toggling reaction:', error);
    return {
      data: null,
      errors: [{ message: 'Failed to toggle reaction', error }],
      statusCode: 500
    };
  }
}

/**
 * Get reactions for a post
 * @param {string} postId - The ID of the post
 * @returns {Promise<Object>} - The reactions data, errors, and status code
 */
export async function getReactions(postId) {
  if (!postId) {
    throw new Error('Post ID is required');
  }

  try {
    // Create URL with query parameters
    const url = new URL(`${API_SOCIAL_POSTS}/${postId}`);
    url.searchParams.append("_reactions", true);

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
    console.error('Error fetching reactions:', error);
    return {
      data: null,
      errors: [{ message: 'Failed to fetch reactions', error }],
      statusCode: 500
    };
  }
}