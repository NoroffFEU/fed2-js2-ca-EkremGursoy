export async function register({
  name,
  email,
  password,
  bio,
  banner,
  avatar,
}) {
  try {
    const response = await fetch("https://v2.api.noroff.dev/auth/register", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, // Required
        email, // Required
        password, // Required
        bio, // Optional
        avatar: {
          url: avatar, // Optional
        },
        banner: {
          url: banner, // Optional
        },
      })
    });
    const { data, errors, statusCode } = await response.json();
    return { data, errors, statusCode };
  } catch (error) {
    console.error("Registration error:", error);
    return { data: null, errors: [{ message: 'Unexpected error.', error }], statusCode: 500 };
  }
}


