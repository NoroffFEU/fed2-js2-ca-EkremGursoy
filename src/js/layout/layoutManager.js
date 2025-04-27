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

  // Initialize the mobile menu functionality
  initMobileMenu();

  // Initialize the logout functionality
  setupLogout();

  // Update UI based on auth status
  updateAuthUI();
}

function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileLogoutButton = document.getElementById('mobile-logout-button');

  if (!mobileMenuButton || !mobileMenu) return;

  // Function to open mobile menu
  function openMobileMenu() {
    mobileMenu.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Prevent scrolling when menu is open

    // Animate menu in
    setTimeout(() => {
      const sidebar = mobileMenu.querySelector('.transform');
      if (sidebar) {
        sidebar.classList.add('translate-x-0');
        sidebar.classList.remove('translate-x-full');
      }
    }, 10);
  }

  // Function to close mobile menu
  function closeMobileMenu() {
    // Animate menu out
    const sidebar = mobileMenu.querySelector('.transform');
    if (sidebar) {
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('translate-x-full');
    }

    // Hide menu after animation
    setTimeout(() => {
      mobileMenu.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }, 300);
  }

  // Event listeners
  mobileMenuButton.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
  }

  // Handle logout in mobile menu
  if (mobileLogoutButton) {
    mobileLogoutButton.addEventListener('click', () => {
      const mainLogoutButton = document.getElementById('logout-button');
      if (mainLogoutButton) {
        // Create and dispatch a click event to reuse the same logic
        mainLogoutButton.click();
      }
    });
  }
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