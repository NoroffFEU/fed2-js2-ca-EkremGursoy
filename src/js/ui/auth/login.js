import { login } from "../../api/auth/login";

export async function onLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.target);

  const { data, errors, statusCode } = await login(Object.fromEntries(formData.entries()));

  if (data) {
    // Store the access token in localStorage
    localStorage.setItem('token', data.accessToken);

    // Optionally store other user data
    localStorage.setItem('user', JSON.stringify({
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      banner: data.banner,
      venueManager: data.venueManager
    }));

    window.location.href = '/';
  } else if (errors) {
    alert(`Error: ${errors[0].message}`);
  }
}
