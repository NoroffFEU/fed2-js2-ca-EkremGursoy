import { authGuard, getCurrentUser } from "../../utilities/authGuard";
import { readProfile, readProfilePosts } from "../../api/profile/read.js";
import { getKey } from "../../api/auth/key.js";
import { onLogout } from "../../ui/auth/logout";
import { setupDeleteButtons } from "../../ui/post/delete";

// Check if user is logged in
authGuard();

// Initialize page
(async function () {
  // Setup logout functionality
  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", onLogout);

  const currentUser = getCurrentUser();
  const username = currentUser.name;

  // Get the profile data
  const { data: profile } = await readProfile(username);

  if (profile) {
    // Update profile display with data from the API
    if (profile.banner) {
      document.getElementById("banner").src = profile.banner.url;
      document.getElementById("banner").alt = profile.banner.alt;
    }

    if (profile.avatar) {
      document.getElementById("avatar").src = profile.avatar.url;
      document.getElementById("avatar").alt = profile.avatar.alt;
    }

    document.getElementById("name").textContent = profile.name;
    document.getElementById("email").textContent = profile.email;

    // Update bio
    document.getElementById("bio").textContent = profile.bio || "No bio provided";

    // Update follower statistics
    document.getElementById("followers-count").textContent = profile._count?.followers || 0;
    document.getElementById("following-count").textContent = profile._count?.following || 0;
  }

  // Fetch and display user's posts
  await fetchUserPosts(username);
})();

/**
 * Fetches and displays the user's posts
 * @param {string} username - The username to fetch posts for
 */
async function fetchUserPosts(username, page = 1, limit = 6) {
  try {
    // Get elements
    const loadingElement = document.getElementById('user-posts-loading');
    const errorElement = document.getElementById('user-posts-error');
    const emptyElement = document.getElementById('user-posts-empty');
    const postsContainer = document.getElementById('user-posts-container');
    const loadMoreButton = document.getElementById('load-more-posts-btn');

    // Show loading state
    loadingElement.classList.remove('hidden');
    errorElement.classList.add('hidden');
    emptyElement.classList.add('hidden');
    postsContainer.classList.add('hidden');
    loadMoreButton.classList.add('hidden');

    // Fetch posts
    const response = await readProfilePosts(username, limit, page);

    // Hide loading indicator
    loadingElement.classList.add('hidden');

    // Handle errors in response
    if (!response || response.errors) {
      const errorMsg = response?.errors ? response.errors[0].message : 'Failed to load posts';
      errorElement.textContent = `Error: ${errorMsg}`;
      errorElement.classList.remove('hidden');
      return;
    }

    // Extract posts data
    const posts = response.data || [];

    // If this is page 1 and there are no posts, show empty state
    if (page === 1 && (!posts || posts.length === 0)) {
      emptyElement.classList.remove('hidden');
      return;
    }

    // Show posts container
    postsContainer.classList.remove('hidden');

    // If this is page 1, clear the container first
    if (page === 1) {
      postsContainer.innerHTML = '';
    }

    // Create and append post cards
    posts.forEach(post => {
      const card = createPostCard(post, true); // true = isOwnPost
      postsContainer.appendChild(card);
    });

    // Set up delete buttons
    setupDeleteButtons('.delete-post-btn', () => {
      // Refresh posts after deletion
      fetchUserPosts(username);
    });

    // Show "Load More" button if there are more posts
    const meta = response.meta;
    if (meta && !meta.isLastPage) {
      loadMoreButton.classList.remove('hidden');

      // Set up load more functionality
      loadMoreButton.onclick = () => {
        fetchUserPosts(username, page + 1, limit);
      };
    } else {
      loadMoreButton.classList.add('hidden');
    }

  } catch (error) {
    console.error('Error fetching user posts:', error);

    // Show error message
    const errorElement = document.getElementById('user-posts-error');
    const loadingElement = document.getElementById('user-posts-loading');

    loadingElement.classList.add('hidden');
    errorElement.classList.remove('hidden');
    errorElement.textContent = `Error loading posts: ${error.message}`;
  }
}

/**
 * Creates a single post card element
 * @param {Object} post - The post data
 * @param {boolean} isOwnPost - Whether the current user is the author
 * @returns {HTMLElement} - The post card element
 */
function createPostCard(post, isOwnPost = false) {
  const { id, title, body, tags = [], media, created, updated } = post;

  // Create card container
  const card = document.createElement('div');
  card.className = 'bg-white overflow-hidden shadow rounded-lg flex flex-col';

  // Add media section if available
  if (media && media.url) {
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'relative pb-48 overflow-hidden';

    const image = document.createElement('img');
    image.className = 'absolute inset-0 h-full w-full object-cover';
    image.src = media.url;
    image.alt = media.alt || title;
    image.onerror = () => {
      image.src = 'https://via.placeholder.com/300x200?text=No+Image';
      image.alt = 'Placeholder image';
    };

    mediaContainer.appendChild(image);
    card.appendChild(mediaContainer);
  }

  // Content section
  const content = document.createElement('div');
  content.className = 'p-4 flex-grow';

  // Title
  const titleElement = document.createElement('h3');
  titleElement.className = 'text-lg font-semibold text-gray-900';
  titleElement.textContent = title;
  content.appendChild(titleElement);

  // Date
  const meta = document.createElement('div');
  meta.className = 'text-sm text-gray-500 mb-2';

  // Format date
  const postDate = new Date(created);
  const formattedDate = postDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  meta.textContent = formattedDate;
  content.appendChild(meta);

  // Body text (truncated)
  const bodyText = document.createElement('p');
  bodyText.className = 'text-gray-600 line-clamp-3';
  bodyText.textContent = body.length > 120 ? body.substring(0, 120) + '...' : body;
  content.appendChild(bodyText);

  // Tags
  if (tags && tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'mt-4 flex flex-wrap gap-2';

    tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full';
      tagElement.textContent = `#${tag}`;
      tagsContainer.appendChild(tagElement);
    });

    content.appendChild(tagsContainer);
  }

  card.appendChild(content);

  // Footer section with actions
  const footer = document.createElement('div');
  footer.className = 'p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between';

  // Action buttons for own posts
  if (isOwnPost) {
    const actionButtons = document.createElement('div');
    actionButtons.className = 'flex space-x-2';

    // View button
    const viewButton = document.createElement('a');
    viewButton.href = `/post/?id=${id}`;
    viewButton.className = 'text-sm px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded';
    viewButton.textContent = 'View';
    actionButtons.appendChild(viewButton);

    // Edit button
    const editButton = document.createElement('a');
    editButton.href = `/post/edit/?id=${id}`;
    editButton.className = 'text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded';
    editButton.textContent = 'Edit';
    actionButtons.appendChild(editButton);

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-post-btn text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded';
    deleteButton.dataset.postId = id;
    deleteButton.dataset.postTitle = title;
    deleteButton.textContent = 'Delete';
    actionButtons.appendChild(deleteButton);

    footer.appendChild(actionButtons);
  } else {
    // Read more link for non-own posts
    const readMoreLink = document.createElement('a');
    readMoreLink.href = `/post/?id=${id}`;
    readMoreLink.className = 'text-sm font-medium text-indigo-600 hover:text-indigo-500';
    readMoreLink.textContent = 'Read more →';
    footer.appendChild(readMoreLink);
  }

  card.appendChild(footer);

  return card;
}
