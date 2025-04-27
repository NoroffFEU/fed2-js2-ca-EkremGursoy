import { createComment } from "../../api/post/comment";

/**
 * Handles the submission of a new comment
 * @param {string} postId - The ID of the post being commented on
 * @param {HTMLFormElement} form - The comment form element
 * @param {Function} onSuccess - Callback function to execute after successful comment submission
 */
export async function handleCommentSubmit(postId, form, onSuccess) {
  try {
    const commentBody = form.elements.commentBody.value.trim();

    if (!commentBody) {
      throw new Error('Comment cannot be empty');
    }

    // Disable form during submission
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
    }

    // Submit the comment
    const { data, errors } = await createComment(postId, commentBody);

    // Re-enable form
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Post Comment';
    }

    if (errors) {
      throw new Error(errors[0].message);
    }

    // Clear the form
    form.reset();

    // Call success callback if provided
    if (typeof onSuccess === 'function') {
      onSuccess(data);
    }

    return data;
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert(`Failed to post comment: ${error.message}`);
    return null;
  }
}

/**
 * Creates a comment element to display in the UI
 * @param {Object} comment - The comment data
 * @param {boolean} isCurrentUser - Whether the current user is the author of the comment
 * @returns {HTMLElement} - The comment element
 */
export function createCommentElement(comment, isCurrentUser = false) {
  // Create comment container
  const commentElement = document.createElement('div');
  commentElement.className = 'bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200';

  // Comment header with author info
  const header = document.createElement('div');
  header.className = 'flex items-center mb-2';

  // The API can return either author or owner, so we need to handle both
  const commentAuthor = comment.author || comment.owner || {};

  // Author avatar (if available)
  if (commentAuthor && commentAuthor.avatar && commentAuthor.avatar.url) {
    const avatar = document.createElement('img');
    avatar.src = commentAuthor.avatar.url;
    avatar.alt = commentAuthor.name || 'User';
    avatar.className = 'w-8 h-8 rounded-full mr-2 object-cover';
    avatar.onerror = () => {
      avatar.src = 'https://via.placeholder.com/40?text=User';
    };
    header.appendChild(avatar);
  } else {
    // Placeholder avatar
    const avatarPlaceholder = document.createElement('div');
    avatarPlaceholder.className = 'w-8 h-8 rounded-full mr-2 bg-gray-300 flex items-center justify-center text-gray-600';
    avatarPlaceholder.textContent = commentAuthor.name ? commentAuthor.name.charAt(0).toUpperCase() : '?';
    header.appendChild(avatarPlaceholder);
  }

  // Author name and date
  const authorInfo = document.createElement('div');
  authorInfo.className = 'flex flex-col';

  const authorName = document.createElement('span');
  authorName.className = 'font-medium text-gray-800';
  authorName.textContent = commentAuthor.name || 'Unknown user';
  authorInfo.appendChild(authorName);

  const commentDate = document.createElement('span');
  commentDate.className = 'text-xs text-gray-500';

  // Format date
  if (comment.created) {
    const date = new Date(comment.created);
    commentDate.textContent = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    commentDate.textContent = 'Just now';
  }

  authorInfo.appendChild(commentDate);
  header.appendChild(authorInfo);

  // Add "You" badge if the comment is by the current user
  if (isCurrentUser) {
    const youBadge = document.createElement('span');
    youBadge.className = 'ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full';
    youBadge.textContent = 'You';
    header.appendChild(youBadge);
  }

  commentElement.appendChild(header);

  // Comment body
  const body = document.createElement('div');
  body.className = 'text-gray-700 whitespace-pre-line';
  body.textContent = comment.body || '';
  commentElement.appendChild(body);

  return commentElement;
}