import { getUserToken } from "../../utilities/authGuard";
import { API_SOCIAL_PROFILES } from "../../api/constants";
import { headers } from "../../api/headers";

/**
 * Update a profile with bio and media
 */
export async function updateProfile(name, profileData) {
  try {
    const token = getUserToken();
    if (!token) {
      return {
        data: null,
        errors: [{ message: 'Authentication required' }],
        statusCode: 401
      };
    }

    const requestHeaders = headers();
    requestHeaders.append("Authorization", `Bearer ${token}`);
    requestHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API_SOCIAL_PROFILES}/${name}`, {
      method: "PUT",
      headers: requestHeaders,
      body: JSON.stringify({
        bio: profileData.bio,
        banner: profileData.banner,
        avatar: profileData.avatar
      })
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to update profile', error }],
      statusCode: 500
    };
  }
}

/**
 * Follow a profile
 */
export async function followProfile(name) {
  try {
    const token = getUserToken();
    if (!token) {
      return {
        data: null,
        errors: [{ message: 'Authentication required' }],
        statusCode: 401
      };
    }

    const requestHeaders = headers();
    requestHeaders.append("Authorization", `Bearer ${token}`);
    requestHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API_SOCIAL_PROFILES}/${name}/follow`, {
      method: "PUT",
      headers: requestHeaders
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error("Follow profile error:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to follow profile', error }],
      statusCode: 500
    };
  }
}

/**
 * Unfollow a profile
 */
export async function unfollowProfile(name) {
  try {
    const token = getUserToken();
    if (!token) {
      return {
        data: null,
        errors: [{ message: 'Authentication required' }],
        statusCode: 401
      };
    }

    const requestHeaders = headers();
    requestHeaders.append("Authorization", `Bearer ${token}`);
    requestHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API_SOCIAL_PROFILES}/${name}/unfollow`, {
      method: "PUT",
      headers: requestHeaders
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error("Unfollow profile error:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to unfollow profile', error }],
      statusCode: 500
    };
  }
}
