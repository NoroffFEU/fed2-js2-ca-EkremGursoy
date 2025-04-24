import { onLogout } from "../../ui/auth/logout";
import { authGuard } from "../../utilities/authGuard";
import { fetchAndRenderPosts } from "../../ui/post/display";

// Check if user is logged in
authGuard();

// Setup logout functionality
const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", onLogout);

// Fetch and display posts
(async function () {
  // Get tag from URL query parameter if present
  const urlParams = new URLSearchParams(window.location.search);
  const tag = urlParams.get('tag');

  // Fetch posts and render them to the posts-container element
  await fetchAndRenderPosts({
    limit: 12,
    page: 1,
    tag: tag,
    containerId: 'posts-container'
  });

  // Setup load more button if it exists
  const loadMoreButton = document.querySelector('button.load-more-btn');
  if (loadMoreButton) {
    let currentPage = 1;

    loadMoreButton.addEventListener('click', async () => {
      currentPage++;

      // Disable button while loading
      loadMoreButton.disabled = true;
      loadMoreButton.textContent = 'Loading...';

      const { data } = await fetchAndRenderPosts({
        limit: 12,
        page: currentPage,
        tag: tag,
        containerId: 'posts-container'
      });

      // Re-enable button
      loadMoreButton.disabled = false;
      loadMoreButton.textContent = 'Load More';

      // Hide button if no more posts or less than limit returned
      if (!data || data.length < 12) {
        loadMoreButton.style.display = 'none';
      }
    });
  }
})();

