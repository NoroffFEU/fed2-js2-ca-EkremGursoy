import { onLogout } from "../../ui/auth/logout";
import { authGuard } from "../../utilities/authGuard";
import { fetchAndRenderPosts } from "../../ui/post/display";

// Check if user is logged in
authGuard();

// Setup logout functionality
const logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener("click", onLogout);

// Track current page for pagination
let currentPage = 1;

// Search form functionality
function setupSearchForm() {
  const searchForm = document.getElementById('search-form');
  if (!searchForm) return;

  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get search parameters
    const queryInput = document.getElementById('search-query');
    const tagInput = document.getElementById('tag-filter');

    const query = queryInput?.value?.trim() || null;
    const tag = tagInput?.value?.trim() || null;

    // Update URL with search params for shareable links
    const url = new URL(window.location);
    if (query) url.searchParams.set('q', query);
    else url.searchParams.delete('q');

    if (tag) url.searchParams.set('tag', tag);
    else url.searchParams.delete('tag');

    // Update browser history without reload
    window.history.pushState({}, '', url);

    // Reset pagination
    currentPage = 1;

    // Fetch and render search results
    const result = await fetchAndRenderPosts({
      limit: 12,
      page: 1,
      query: query,
      tag: tag,
      containerId: 'posts-container',
      append: false
    });

    // Update load more button visibility
    const loadMoreButton = document.querySelector('button.load-more-btn');
    if (loadMoreButton) {
      if (!result.data || result.data.length < 12 || result.isLastPage) {
        loadMoreButton.style.display = 'none';
      } else {
        loadMoreButton.style.display = 'block';
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = 'Load More';
      }
    }
  });

  // Clear button functionality
  const clearButton = document.getElementById('clear-search');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      // Reset form
      searchForm.reset();

      // Clear URL parameters
      const url = new URL(window.location);
      url.searchParams.delete('q');
      url.searchParams.delete('tag');
      window.history.pushState({}, '', url);

      // Reset to initial load
      currentPage = 1;

      // Fetch and render default posts
      fetchAndRenderPosts({
        limit: 12,
        page: 1,
        containerId: 'posts-container',
        append: false
      });

      // Show load more button
      const loadMoreButton = document.querySelector('button.load-more-btn');
      if (loadMoreButton) {
        loadMoreButton.style.display = 'block';
        loadMoreButton.disabled = false;
        loadMoreButton.textContent = 'Load More';
      }
    });
  }
}

// Fetch and display posts
(async function () {
  // Get parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const tag = urlParams.get('tag');
  const query = urlParams.get('q');

  // Pre-fill search form if URL has parameters
  if (tag || query) {
    const tagInput = document.getElementById('tag-filter');
    const queryInput = document.getElementById('search-query');

    if (tagInput && tag) tagInput.value = tag;
    if (queryInput && query) queryInput.value = query;
  }

  // Setup search form
  setupSearchForm();

  // Fetch initial posts and render them to the posts-container element
  await fetchAndRenderPosts({
    limit: 12,
    page: 1,
    tag: tag,
    query: query,
    containerId: 'posts-container',
    append: false
  });

  // Setup load more button if it exists
  const loadMoreButton = document.querySelector('button.load-more-btn');
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', async () => {
      currentPage++;

      // Disable button while loading
      loadMoreButton.disabled = true;
      loadMoreButton.textContent = 'Loading...';

      // Get current search parameters
      const urlParams = new URLSearchParams(window.location.search);
      const tag = urlParams.get('tag');
      const query = urlParams.get('q');

      // Fetch next page and append to existing posts
      const result = await fetchAndRenderPosts({
        limit: 12,
        page: currentPage,
        tag: tag,
        query: query,
        containerId: 'posts-container',
        append: true
      });

      // Re-enable button
      loadMoreButton.disabled = false;
      loadMoreButton.textContent = 'Load More';

      // Hide button if no more posts or less than limit returned
      if (!result.data || result.data.length < 12 || result.isLastPage) {
        loadMoreButton.style.display = 'none';
      }
    });
  }
})();

