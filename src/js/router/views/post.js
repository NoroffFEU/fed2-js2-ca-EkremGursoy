import { authGuard, getCurrentUser } from "../../utilities/authGuard";
import { readPost } from "../../api/post/read";
import { readProfile } from "../../api/profile/read";
import { onDeletePost } from "../../ui/post/delete";
import { followProfile, unfollowProfile } from "../../api/profile/update";
import { createComment } from "../../api/post/comment";
import { reactToPost } from "../../api/post/react";
import { handleCommentSubmit, createCommentElement } from "../../ui/post/comment";
import { createReactionButtons, COMMON_REACTIONS } from "../../ui/post/react";
import { API_SOCIAL_POSTS } from "../../api/constants";

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
    // const errorElement = document.getElementById('post-error');
    // const headerElement = document.getElementById('post-header');
    // const mediaElement = document.getElementById('post-media');
    // const contentElement = document.getElementById('post-content');
    // const reactionsElement = document.getElementById('post-reactions');
    // const statsElement = document.getElementById('post-stats');
    // const commentsElement = document.getElementById('post-comments');

    // Fetch post data with comments and reactions
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

    // Display reactions
    if (post.reactions) {
      displayReactions(post.reactions, post.id, currentUser);
    } else {
      // If no reactions field, initialize empty reactions UI
      displayReactions([], post.id, currentUser);
    }

    // Display comments
    if (post.comments) {
      displayComments(post.comments, post.id, currentUser);
    } else {
      // If no comments field, show the empty state
      const commentsEmpty = document.getElementById('comments-empty');
      const commentsLoading = document.getElementById('comments-loading');
      if (commentsLoading) commentsLoading.classList.add('hidden');
      if (commentsEmpty) commentsEmpty.classList.remove('hidden');
    }

    // Setup comment form
    setupCommentForm(post.id, currentUser);

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
async function populatePostData(post, currentUser) {
  // Get elements
  const headerElement = document.getElementById('post-header');
  const mediaElement = document.getElementById('post-media');
  const contentElement = document.getElementById('post-content');
  const statsElement = document.getElementById('post-stats');
  const reactionsElement = document.getElementById('post-reactions');
  const commentsElement = document.getElementById('post-comments');

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

  // Add follow/unfollow button if:
  // 1. User is logged in
  // 2. User is not the author
  // 3. There is a valid author
  if (currentUser && post.author && post.author.name && currentUser.name !== post.author.name) {
    // We need to fetch the author's profile to check if the current user is following them
    await addFollowButton(post.author.name, currentUser);
  }

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
  } else {
    // Fallback to array length if _count is not available
    commentCountElement.textContent = post.comments ? post.comments.length : 0;

    // Count total reactions correctly
    let totalReactions = 0;
    if (post.reactions && Array.isArray(post.reactions)) {
      totalReactions = post.reactions.length;
    }
    reactionCountElement.textContent = totalReactions;
  }

  // Show all post elements
  headerElement.classList.remove('hidden');
  contentElement.classList.remove('hidden');
  statsElement.classList.remove('hidden');
  reactionsElement.classList.remove('hidden');
  commentsElement.classList.remove('hidden');
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

/**
 * Adds a follow/unfollow button to the post author section
 * @param {string} authorName - The name of the post author
 * @param {Object} currentUser - The current user data
 */
async function addFollowButton(authorName, currentUser) {
  // Get the metadata element where we'll add the follow button
  const metaElement = document.querySelector('#post-header .mt-1');
  if (!metaElement) return;

  // Create the follow button container
  const followContainer = document.createElement('div');
  followContainer.className = 'ml-auto';

  // Add a loading indicator while we fetch the profile data
  const loadingSpinner = document.createElement('div');
  loadingSpinner.className = 'inline-block px-3 py-1 text-gray-500';
  loadingSpinner.textContent = 'Loading...';
  followContainer.appendChild(loadingSpinner);
  metaElement.appendChild(followContainer);

  try {
    // Fetch the author's profile to check if the current user is following them
    const { data: authorProfile, errors } = await readProfile(authorName);

    if (errors || !authorProfile) {
      console.error('Error fetching author profile:', errors);
      followContainer.remove();
      return;
    }

    // Remove loading indicator
    loadingSpinner.remove();

    // Create the follow/unfollow button
    const followButton = document.createElement('button');
    followButton.id = 'follow-button';
    followButton.className = 'text-sm px-3 py-1 ml-2 rounded font-medium';
    followContainer.appendChild(followButton);

    // Determine if current user is following the author
    let isFollowing = false;

    // Check if author profile has followers and if current user is among them
    if (authorProfile.followers && Array.isArray(authorProfile.followers)) {
      isFollowing = authorProfile.followers.some(follower =>
        follower.name === currentUser.name
      );
    }

    // Set initial button state
    updateFollowButtonState(followButton, isFollowing);

    // Add click event handler
    followButton.addEventListener('click', async () => {
      // Disable button during API call
      followButton.disabled = true;
      followButton.classList.add('opacity-50');

      try {
        let response;

        if (isFollowing) {
          // Unfollow action
          response = await unfollowProfile(authorName);
        } else {
          // Follow action
          response = await followProfile(authorName);
        }

        // Check for errors
        if (response.errors) {
          throw new Error(response.errors[0].message);
        }

        // Toggle following state
        isFollowing = !isFollowing;

        // Update button state
        updateFollowButtonState(followButton, isFollowing);

      } catch (error) {
        console.error('Error toggling follow state:', error);

        // Show error as tooltip or small notification
        const errorTooltip = document.createElement('div');
        errorTooltip.className = 'absolute -top-8 right-0 bg-red-100 text-red-600 text-xs p-1 rounded';
        errorTooltip.textContent = error.message || 'Failed to update';

        followContainer.style.position = 'relative';
        followContainer.appendChild(errorTooltip);

        // Remove error message after 3 seconds
        setTimeout(() => {
          errorTooltip.remove();
        }, 3000);
      }

      // Re-enable button
      followButton.disabled = false;
      followButton.classList.remove('opacity-50');
    });
  } catch (error) {
    console.error('Error setting up follow button:', error);
    // Remove container if there was an error
    followContainer.remove();
  }
}

/**
 * Updates the follow button appearance based on follow state
 * @param {HTMLElement} button - The follow/unfollow button
 * @param {boolean} isFollowing - Whether user is following the author
 */
function updateFollowButtonState(button, isFollowing) {
  if (isFollowing) {
    // Unfollow state
    button.className = 'text-sm px-3 py-1 ml-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium';
    button.textContent = 'Unfollow';
  } else {
    // Follow state
    button.className = 'text-sm px-3 py-1 ml-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded font-medium';
    button.textContent = 'Follow';
  }
}

/**
 * Display reactions for a post
 * @param {Array} reactions - Array of reaction objects
 * @param {string} postId - The post ID
 * @param {Object} currentUser - The current user
 */
function displayReactions(reactions, postId, currentUser) {
  const reactionsContainer = document.getElementById('reactions-container');

  if (!reactionsContainer) return;

  // Clear previous content
  reactionsContainer.innerHTML = '';

  // Generate reaction buttons
  const reactionButtons = createReactionButtons(
    postId,
    reactions,
    currentUser ? currentUser.name : '',
    async (symbol, isAdded, updatedReactions) => {
      // If we have updated reactions data from the server, update the total reaction count
      if (updatedReactions && Array.isArray(updatedReactions)) {
        const totalReactions = updatedReactions.length;
        const reactionCountElement = document.getElementById('post-reaction-count');
        if (reactionCountElement) {
          reactionCountElement.textContent = totalReactions;
        }
      } else {
        // Fallback to local count update if server data isn't available
        updateReactionCount(isAdded ? 1 : -1);
      }
    }
  );

  reactionsContainer.appendChild(reactionButtons);

  // Set initial total reaction count
  updateTotalReactionCount(reactions);
}

/**
 * Updates the reaction count in the UI
 * @param {number} change - The amount to change the count by (+1 for add, -1 for remove)
 */
function updateReactionCount(change) {
  const reactionCountElement = document.getElementById('post-reaction-count');
  if (reactionCountElement) {
    const currentCount = parseInt(reactionCountElement.textContent, 10) || 0;
    reactionCountElement.textContent = Math.max(0, currentCount + change);
  }
}

/**
 * Set the total reaction count in the UI based on reactions array
 * @param {Array} reactions - The array of reaction objects
 */
function updateTotalReactionCount(reactions) {
  const reactionCountElement = document.getElementById('post-reaction-count');
  if (reactionCountElement && reactions && Array.isArray(reactions)) {
    reactionCountElement.textContent = reactions.length;
  }
}

/**
 * Display comments for a post
 * @param {Array} comments - Array of comment objects
 * @param {string} postId - The post ID
 * @param {Object} currentUser - The current user
 */
function displayComments(comments, postId, currentUser) {
  const commentsContainer = document.getElementById('comments-container');
  const commentsLoading = document.getElementById('comments-loading');
  const commentsError = document.getElementById('comments-error');
  const commentsEmpty = document.getElementById('comments-empty');
  const commentsList = document.getElementById('comments-list');

  if (!commentsContainer || !commentsLoading || !commentsError || !commentsEmpty || !commentsList) {
    return;
  }

  // Hide loading indicator
  commentsLoading.classList.add('hidden');

  // Sort comments by date (newest first)
  const sortedComments = [...comments].sort((a, b) => {
    return new Date(b.created) - new Date(a.created);
  });

  if (!sortedComments.length) {
    // Show empty state if no comments
    commentsEmpty.classList.remove('hidden');
    return;
  }

  // Show comments list
  commentsList.classList.remove('hidden');
  commentsList.innerHTML = '';

  // Generate comment elements
  sortedComments.forEach(comment => {
    // Check if the current user is the author of the comment
    const isCurrentUser = currentUser &&
      ((comment.owner && comment.owner.name === currentUser.name) ||
        (comment.author && comment.author.name === currentUser.name));

    const commentElement = createCommentElement(comment, isCurrentUser);
    commentsList.appendChild(commentElement);
  });

  // Update comment count
  updateCommentCount(sortedComments.length);
}

/**
 * Updates the comment count in the UI
 * @param {number} count - The new comment count
 */
function updateCommentCount(count) {
  const commentCountElement = document.getElementById('post-comment-count');
  if (commentCountElement) {
    commentCountElement.textContent = count;
  }
}

/**
 * Setup comment form functionality
 * @param {string} postId - The post ID
 * @param {Object} currentUser - The current user
 */
function setupCommentForm(postId, currentUser) {
  const commentForm = document.getElementById('comment-form');

  if (!commentForm) return;

  commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Submit comment
    const newComment = await handleCommentSubmit(postId, commentForm, (commentData) => {
      if (commentData) {
        // Add the new comment to the top of the list
        const commentsList = document.getElementById('comments-list');
        const commentsEmpty = document.getElementById('comments-empty');

        if (commentsEmpty) {
          commentsEmpty.classList.add('hidden');
        }

        if (commentsList) {
          const isCurrentUser = true; // The new comment is always from the current user

          const enrichedCommentData = {
            ...commentData,
            author: {
              name: currentUser.name,
              avatar: currentUser.avatar
            }
          };

          const commentElement = createCommentElement(enrichedCommentData, isCurrentUser);

          // Add the new comment at the top
          if (commentsList.firstChild) {
            commentsList.insertBefore(commentElement, commentsList.firstChild);
          } else {
            commentsList.appendChild(commentElement);
          }

          commentsList.classList.remove('hidden');

          // Update the comment count
          updateCommentCount(parseInt(document.getElementById('post-comment-count').textContent, 10) + 1);
        }
      }
    });
  });
}
