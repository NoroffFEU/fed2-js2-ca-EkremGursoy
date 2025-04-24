import { authGuard, getCurrentUser } from "../../utilities/authGuard";
import { readPost } from "../../api/post/read";
import { onDeletePost } from "../../ui/post/delete";

// Check if user is logged in
authGuard();

// Initialize post view
(async function () {
  // Get post ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    showError('No post ID provided');
    return;
  }

  try {
    // Get current user if available
    let currentUser = null;
    try {
      currentUser = getCurrentUser();
    } catch (error) {
      console.warn('Not logged in, viewing as guest');
    }

    // Show loading state
    const loadingElement = document.getElementById('post-loading');
    const errorElement = document.getElementById('post-error');
    const headerElement = document.getElementById('post-header');
    const mediaElement = document.getElementById('post-media');
    const contentElement = document.getElementById('post-content');
    const statsElement = document.getElementById('post-stats');

    // Fetch post data
    const { data: post, errors } = await readPost(postId);

    // Hide loading indicator
    loadingElement.classList.add('hidden');

    if (errors || !post) {
      showError(errors ? errors[0].message : 'Post not found');
      return;
    }

    // Set page title
    document.title = `${post.title} | Noroff Social`;

    // Populate post data
    populatePostData(post, currentUser);

    // Setup delete functionality if user owns the post
    setupDeleteButton(post, currentUser);

  } catch (error) {
    console.error('Error loading post:', error);
    showError('Failed to load post');
  }
})();

/**
 * Shows an error message
 * @param {string} message - The error message
 */
function showError(message) {
  const loadingElement = document.getElementById('post-loading');
  const errorElement = document.getElementById('post-error');

  loadingElement.classList.add('hidden');
  errorElement.classList.remove('hidden');
  errorElement.textContent = message || 'Error loading post. Please try again later.';
}

/**
 * Populates the post data in the UI
 * @param {Object} post - The post data
 * @param {Object} currentUser - The current user data
 */
function populatePostData(post, currentUser) {
  // Get elements
  const headerElement = document.getElementById('post-header');
  const mediaElement = document.getElementById('post-media');
  const contentElement = document.getElementById('post-content');
  const statsElement = document.getElementById('post-stats');

  const titleElement = document.getElementById('post-title');
  const authorElement = document.getElementById('post-author');
  const dateElement = document.getElementById('post-date');
  const tagsElement = document.getElementById('post-tags');
  const bodyElement = document.getElementById('post-body');
  const imageElement = document.getElementById('post-image');
  const commentCountElement = document.getElementById('post-comment-count');
  const reactionCountElement = document.getElementById('post-reaction-count');

  // Set post title
  titleElement.textContent = post.title;

  // Set author info - safely handle potential missing author
  const authorName = post.author && post.author.name ? post.author.name : 'Unknown';
  authorElement.textContent = authorName;
  authorElement.href = post.author ? `/profile/?name=${authorName}` : '#';

  // Format and set date
  const postDate = new Date(post.created);
  dateElement.textContent = postDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Add tags
  if (post.tags && post.tags.length > 0) {
    tagsElement.innerHTML = '';
    post.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full';
      tagElement.textContent = `#${tag}`;
      tagsElement.appendChild(tagElement);
    });
  }

  // Set post body content
  bodyElement.textContent = post.body;

  // Handle media/image if available
  if (post.media && post.media.url) {
    imageElement.src = post.media.url;
    imageElement.alt = post.media.alt || post.title;
    mediaElement.classList.remove('hidden');

    // Handle image load error
    imageElement.onerror = function () {
      mediaElement.classList.add('hidden');
    };
  }

  // Set comment and reaction counts
  if (post._count) {
    commentCountElement.textContent = post._count.comments || 0;
    reactionCountElement.textContent = post._count.reactions || 0;
  }

  // Show all post elements
  headerElement.classList.remove('hidden');
  contentElement.classList.remove('hidden');
  statsElement.classList.remove('hidden');
}

/**
 * Setup delete button functionality if user owns the post
 * @param {Object} post - The post data
 * @param {Object} currentUser - The current user data
 */
function setupDeleteButton(post, currentUser) {
  // Show edit/delete buttons if user owns the post
  if (currentUser && post.author && post.author.name === currentUser.name) {
    const actionsElement = document.getElementById('post-actions');
    const deleteButton = document.getElementById('delete-post-btn');
    const editButton = document.getElementById('edit-post-btn');

    // Show actions
    actionsElement.classList.remove('hidden');

    // Set edit link
    editButton.href = `/post/edit/?id=${post.id}`;

    // Add delete post data attributes
    deleteButton.dataset.postId = post.id;
    deleteButton.dataset.postTitle = post.title;

    // Add delete event handler
    deleteButton.addEventListener('click', async function (event) {
      event.preventDefault();

      const success = await onDeletePost(post.id, post.title);

      if (success) {
        window.location.href = '/';
      }
    });
  }
}
