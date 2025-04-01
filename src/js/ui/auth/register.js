import { register } from "../../api/auth/register";

export async function onRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  if (formData.get("password") !== formData.get("passwordConfirm")) {
    alert("Passwords do not match.");
    return;
  }

  const { errors, statusCode } = await register(Object.fromEntries(formData.entries()));

  if (statusCode === 201) {
    window.location.href = '/auth/login/';
  } else if (errors) {
    alert(`Error: ${errors[0].message}`);
  }
}
