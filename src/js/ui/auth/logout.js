export function onLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('user');
    window.location.href = '/auth/login/';
  }
}
