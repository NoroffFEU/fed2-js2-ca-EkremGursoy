export async function loadLayout() {
  // Fetch navbar and footer HTML
  const navbarResponse = await fetch('/src/templates/navbar.html');
  const footerResponse = await fetch('/src/templates/footer.html');

  const navbarHtml = await navbarResponse.text();
  const footerHtml = await footerResponse.text();

  // Get the main content from the current page
  const body = document.body;

  // Create a container for the main content
  const mainContent = document.createElement('main');
  mainContent.id = 'content';
  mainContent.className = 'container mx-auto p-4 min-h-[calc(100vh-160px)]';

  // Move all existing body elements to the main content
  while (body.firstChild) {
    mainContent.appendChild(body.firstChild);
  }

  // Add navbar, main content, and footer to the body
  body.innerHTML = navbarHtml;
  body.appendChild(mainContent);
  body.insertAdjacentHTML('beforeend', footerHtml);

  // Setup body styling
  body.className = 'flex flex-col min-h-screen bg-gray-100';

  // Initialize the logout functionality
  setupLogout();

  // Update UI based on auth status
  updateAuthUI();
}

function setupLogout() {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = '/auth/login/';
      }
    });
  }
}

function updateAuthUI() {
  const isLoggedIn = localStorage.getItem('user') !== null;

  document.querySelectorAll('.auth-only-logged-in').forEach(el => {
    el.style.display = isLoggedIn ? 'block' : 'none';
  });

  document.querySelectorAll('.auth-only-logged-out').forEach(el => {
    el.style.display = isLoggedIn ? 'none' : 'block';
  });
}