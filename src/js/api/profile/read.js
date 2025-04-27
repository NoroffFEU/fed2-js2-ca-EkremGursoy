import { getUserToken } from "../../utilities/authGuard";
import { API_SOCIAL_PROFILES } from "../../api/constants";
import { headers } from "../../api/headers";

/**
 * Get a single profile by name
 * @param {string} name - The profile name to fetch
 * @returns {Promise<Object>} - The profile data, errors, and status code
 */
export async function readProfile(name) {
  try {
    const url = new URL(`${API_SOCIAL_PROFILES}/${name}`);
    url.searchParams.append("_following", true);
    url.searchParams.append("_followers", true);

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
    console.error("Error fetching profile:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to fetch profile', error }],
      statusCode: 500
    };
  }
}

/**
 * Get all profiles with optional pagination
 * @param {number} limit - The number of profiles to fetch
 * @param {number} page - The page number
 * @returns {Promise<Object>} - The profiles data, errors, and status code
 */
export async function readProfiles(limit = 20, page = 1) {
  try {
    const url = new URL(`${API_SOCIAL_PROFILES}`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("page", page);
    url.searchParams.append("_following", true);
    url.searchParams.append("_followers", true);

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
    console.error("Error fetching profiles:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to fetch profiles', error }],
      statusCode: 500
    };
  }
}

/**
 * Get all posts from a specific profile
 * @param {string} name - The profile name to get posts from
 * @param {number} limit - The number of posts to fetch
 * @param {number} page - The page number
 * @returns {Promise<Object>} - The posts data, errors, and status code
 */
export async function readProfilePosts(name, limit = 20, page = 1) {
  try {
    const url = new URL(`${API_SOCIAL_PROFILES}/${name}/posts`);
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
    console.error("Error fetching profile posts:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to fetch profile posts', error }],
      statusCode: 500
    };
  }
}
