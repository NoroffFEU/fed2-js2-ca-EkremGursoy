import { getUserToken } from "../../utilities/authGuard";
import { API_SOCIAL_POSTS } from "../constants";
import { headers } from "../headers";

/**
 * Get a single post by id
 * @param {string} id - The post id
 * @returns {Promise<Object>} - The post data, errors, and status code
 */
export async function readPost(id) {
  try {
    const url = new URL(`${API_SOCIAL_POSTS}/${id}`);
    url.searchParams.append("_author", true);
    url.searchParams.append("_comments", true);
    url.searchParams.append("_reactions", true);

    const requestHeaders = headers();
    const token = getUserToken();
    if (token) {
      requestHeaders.append("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      headers: requestHeaders
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error("Error fetching post:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to fetch post', error }],
      statusCode: 500
    };
  }
}

/**
 * Get all posts with optional pagination and tag filtering
 * @param {number} limit - The number of posts to fetch
 * @param {number} page - The page number
 * @param {string} tag - Optional tag to filter posts by
 * @returns {Promise<Object>} - The posts data, errors, and status code
 */
export async function readPosts(limit = 12, page = 1, tag = null) {
  try {
    const url = new URL(`${API_SOCIAL_POSTS}`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("page", page);
    url.searchParams.append("_author", true);

    // Add tag filter if provided
    if (tag) {
      url.searchParams.append("_tag", tag);
    }

    const requestHeaders = headers();
    const token = getUserToken();
    if (token) {
      requestHeaders.append("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      headers: requestHeaders
    });

    const { data, errors, statusCode } = await response.json();

    return { data, errors, statusCode };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to fetch posts', error }],
      statusCode: 500
    };
  }
}

/**
 * Search for posts by query text
 * @param {string} query - The search query text to search in title and body
 * @param {number} limit - The number of posts to fetch
 * @param {number} page - The page number
 * @returns {Promise<Object>} - The posts data, errors, and status code
 */
export async function searchPosts(query, limit = 12, page = 1) {
  try {
    const url = new URL(`${API_SOCIAL_POSTS}/search`);
    url.searchParams.append("q", query);
    url.searchParams.append("limit", limit);
    url.searchParams.append("page", page);
    url.searchParams.append("_author", true);

    const requestHeaders = headers();
    const token = getUserToken();
    if (token) {
      requestHeaders.append("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      headers: requestHeaders
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error("Error searching posts:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to search posts', error }],
      statusCode: 500
    };
  }
}

/**
 * Get all posts from a specific user
 * @param {string} username - The username to get posts from
 * @param {number} limit - The number of posts to fetch
 * @param {number} page - The page number
 * @returns {Promise<Object>} - The posts data, errors, and status code
 */
export async function readPostsByUser(username, limit = 12, page = 1) {
  try {
    const url = new URL(`${API_SOCIAL_POSTS}/profiles/${username}`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("page", page);
    url.searchParams.append("_author", true);

    const requestHeaders = headers();
    const token = getUserToken();
    if (token) {
      requestHeaders.append("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(url, {
      headers: requestHeaders
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to fetch user posts', error }],
      statusCode: 500
    };
  }
}
