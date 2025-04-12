export function getCurrentUser() {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
}

export function getUserToken() {
  const token = localStorage.getItem('token');
  return token ? JSON.parse(token) : null;
}