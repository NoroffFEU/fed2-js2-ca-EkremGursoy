export function authGuard() {
  const token = getUserToken();
  if (!token) {
    alert("You must be logged in to view this page");
    window.location.href = "/auth/login/";
  }
}

export function getCurrentUser() {
  const userJson = localStorage.getItem("user");
  return userJson ? JSON.parse(userJson) : null;
}

export function getUserToken() {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  const user = JSON.parse(userJson);
  return user.accessToken ? user.accessToken : null;
}
