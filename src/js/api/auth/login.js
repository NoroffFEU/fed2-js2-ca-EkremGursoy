export async function login({ email, password }) {
  try {
    const response = await fetch("https://v2.api.noroff.dev/auth/login", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
      })
    });

    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error("Registration error:", error);
    return { data: null, errors: [{ message: 'Unexpected error.', error }], statusCode: 500 };
  }
}
