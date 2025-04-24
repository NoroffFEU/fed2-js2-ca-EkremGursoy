import { getUserToken } from "../../utilities/authGuard";

export async function getKey(name = "default") {
  try {
    const token = getUserToken();
    if (!token) {
      return {
        data: null,
        errors: [{ message: 'Authentication required' }],
        statusCode: 401
      };
    }

    const response = await fetch("https://v2.api.noroff.dev/auth/create-api-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error("API key creation error:", error);
    return {
      data: null,
      errors: [{ message: 'Failed to create API key', error }],
      statusCode: 500
    };
  }
}
