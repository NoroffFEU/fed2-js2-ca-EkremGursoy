import { getUserToken } from "../../utilities/authGuard";
import { API_SOCIAL_PROFILES } from "../../api/constants";
import { headers } from "../../api/headers";

/**
 * Get a single profile by name
 */
export async function readProfile(name) {
  try {
    const requestHeaders = headers();
    const token = getUserToken();
    if (token) {
      requestHeaders.append("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_SOCIAL_PROFILES}/${name}`, {
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
 */
export async function readProfiles(limit = 20, page = 1) {
  try {
    const url = new URL(`${API_SOCIAL_PROFILES}`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("page", page);

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
 */
export async function readProfilePosts(name, limit = 20, page = 1) {
  try {
    const url = new URL(`${API_SOCIAL_PROFILES}/${name}/posts`);
    url.searchParams.append("limit", limit);
    url.searchParams.append("page", page);

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
