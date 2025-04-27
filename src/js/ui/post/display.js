import { readPosts, searchPosts } from "../../api/post/read";
import { setupDeleteButtons } from "./delete";

/**
 * Creates a single post card element
 * @param {Object} post - The post data
 * @param {boolean} isOwnPost - Whether the current user is the author
 * @returns {HTMLElement} - The post card element
 */
function createPostCard(post, isOwnPost = false) {
  const { id, title, body, tags = [], media, created, updated, author } = post;

  // Create card container
  const card = document.createElement('div');
  card.className = 'bg-white overflow-hidden shadow rounded-lg';

  // Add media section if available
  if (media && media.url) {
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'relative pb-48 overflow-hidden';

    const image = document.createElement('img');
    image.className = 'absolute inset-0 h-full w-full object-cover';
    image.src = media.url;
    image.alt = media.alt || title;

    mediaContainer.appendChild(image);
    card.appendChild(mediaContainer);
  }

  // Content section
  const content = document.createElement('div');
  content.className = 'p-4';

  // Title
  const titleElement = document.createElement('h3');
  titleElement.className = 'text-lg font-semibold text-gray-900';
  titleElement.textContent = title || 'Untitled Post';
  content.appendChild(titleElement);

  // Author and date
  const meta = document.createElement('div');
  meta.className = 'text-sm text-gray-500 mb-2';

  // Format date
  const postDate = new Date(created);
  const formattedDate = postDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Safe access to author name
  const authorName = author && author.name ? author.name : 'Unknown';
  meta.innerHTML = `Posted by <span class="text-indigo-600">${authorName}</span> • ${formattedDate}`;
  content.appendChild(meta);

  // Body text (truncated)
  const bodyText = document.createElement('p');
  bodyText.className = 'text-gray-600 line-clamp-3';
  // Handle null or empty body
  const safeBody = body || 'No content';
  bodyText.textContent = safeBody.length > 150 ? safeBody.substring(0, 150) + '...' : safeBody;
  content.appendChild(bodyText);

  // Tags
  if (tags && tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'mt-4 flex flex-wrap gap-2';

    tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full';
      tagElement.textContent = `#${tag}`;

      // Add click event to filter by this tag
      tagElement.addEventListener('click', () => {
        // Set the tag filter input and submit the search form
        const tagInput = document.getElementById('tag-filter');
        if (tagInput) {
          tagInput.value = tag;
          const searchForm = document.getElementById('search-form');
          if (searchForm) searchForm.dispatchEvent(new Event('submit'));
        }
      });

      tagElement.style.cursor = 'pointer';
      tagsContainer.appendChild(tagElement);
    });

    content.appendChild(tagsContainer);
  }

  card.appendChild(content);

  // Footer section with actions
  const footer = document.createElement('div');
  footer.className = 'p-4 border-t border-gray-200 flex items-center justify-between';

  // Read more link
  const readMoreLink = document.createElement('a');
  readMoreLink.href = `/post/?id=${id}`;
  readMoreLink.className = 'text-sm font-medium text-indigo-600 hover:text-indigo-500';
  readMoreLink.textContent = 'Read more →';
  footer.appendChild(readMoreLink);

  // Add edit/delete buttons if it's the user's own post
  if (isOwnPost) {
    const actionButtons = document.createElement('div');
    actionButtons.className = 'flex space-x-2';

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
  }

  card.appendChild(footer);

  return card;
}

/**
 * Renders multiple post cards into a container
 * @param {Array} posts - Array of post objects
 * @param {string} containerId - ID of the container element
 * @param {string} currentUsername - Current user's username
 * @param {boolean} append - Whether to append to existing posts or replace them
 */
export async function renderPostCards(posts, containerId = 'posts-container', currentUsername = '', append = false) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container with ID '${containerId}' not found`);
    return;
  }

  // Clear container if not appending
  if (!append) {
    container.innerHTML = '';
  }

  if (!posts || posts.length === 0) {
    // Only show empty message if container is empty (not when appending)
    if (!append || container.children.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'text-center py-10 text-gray-500';
      emptyMessage.textContent = 'No posts found';
      container.appendChild(emptyMessage);
    }
    return;
  }

  // Create and append each post card
  posts.forEach(post => {
    try {
      // Safe check for author property
      const isOwnPost = post.author && post.author.name === currentUsername;
      const card = createPostCard(post, isOwnPost);
      container.appendChild(card);
    } catch (error) {
      console.error('Error creating post card:', error, post);
      // Skip this post but continue with others
    }
  });

  // Set up delete buttons if there are any
  setupDeleteButtons('.delete-post-btn', () => {
    // Refresh the page after successful deletion
    window.location.reload();
  });
}

/**
 * Updates heading text based on search context
 * @param {string} query - Search query
 * @param {string} tag - Tag filter
 */
function updateResultsHeading(query, tag) {
  const heading = document.querySelector('h2.text-xl.font-semibold');
  if (!heading) return;

  if (query && tag) {
    heading.textContent = `Results for "${query}" with tag #${tag}`;
  } else if (query) {
    heading.textContent = `Search results for "${query}"`;
  } else if (tag) {
    heading.textContent = `Posts with tag #${tag}`;
  } else {
    heading.textContent = 'Recent Posts';
  }
}

/**
 * Fetches posts and renders them as cards
 * @param {Object} options - Options for fetching posts
 * @param {number} options.limit - Number of posts to fetch
 * @param {number} options.page - Page number
 * @param {string} options.tag - Optional tag filter
 * @param {string} options.query - Optional search query
 * @param {string} options.containerId - ID of the container element
 * @param {boolean} options.append - Whether to append new posts or replace existing ones
 */
export async function fetchAndRenderPosts({
  limit = 12,
  page = 1,
  tag = null,
  query = null,
  containerId = 'posts-container',
  append = false
} = {}) {
  try {
    // Get current user if logged in
    let currentUsername = '';
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        currentUsername = user.name;
      }
    } catch (error) {
      console.warn('Error getting current user', error);
    }

    // Show loading state if not appending
    const container = document.getElementById(containerId);
    if (container && !append) {
      container.innerHTML = '<div class="text-center py-10">Loading posts...</div>';
    }

    // Add loading indicator at the bottom if appending
    let loadingIndicator = null;
    if (container && append) {
      loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'col-span-full text-center py-4 text-gray-500';
      loadingIndicator.textContent = 'Loading more posts...';
      container.appendChild(loadingIndicator);
    }

    // Update the heading based on search context
    updateResultsHeading(query, tag);

    // Fetch posts based on search parameters
    let response;
    if (query) {
      // If we have a search query, use the search endpoint
      response = await searchPosts(query, limit, page);
    } else {
      // Otherwise use regular posts endpoint with optional tag filter
      response = await readPosts(limit, page, tag);
    }

    // Remove loading indicator if appending
    if (loadingIndicator) {
      loadingIndicator.remove();
    }

    // Check if we have the expected response structure
    if (!response) {
      throw new Error('No response from API');
    }

    // Handle errors in response
    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    // Extract posts data
    const postsData = response.data;

    if (!postsData) {
      throw new Error('No posts data found in response');
    }

    // Render posts
    renderPostCards(postsData, containerId, currentUsername, append);

    return {
      data: postsData,
      meta: response.meta,
      isLastPage: postsData.length < limit
    };
  } catch (error) {
    console.error('Error fetching posts:', error);

    // Show error message
    const container = document.getElementById(containerId);
    if (container && !append) {
      container.innerHTML = `
        <div class="text-center py-10 text-red-500">
          Error loading posts: ${error.message}
        </div>
      `;
    } else if (container && append) {
      // Create error toast for append mode
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed bottom-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg';
      errorToast.textContent = `Error loading more posts: ${error.message}`;
      document.body.appendChild(errorToast);

      // Remove after 3 seconds
      setTimeout(() => {
        errorToast.remove();
      }, 3000);
    }

    return {
      data: null,
      meta: null,
      isLastPage: true
    };
  }
}