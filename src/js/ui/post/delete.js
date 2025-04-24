import { deletePost } from "../../api/post/delete";

/**
 * Handles post deletion with confirmation
 * @param {string} postId - The ID of the post to delete
 * @param {string} postTitle - The title of the post (for confirmation message)
 * @returns {Promise<boolean>} - True if deletion was successful
 */
export async function onDeletePost(postId, postTitle = 'this post') {
  // Confirm deletion with user
  const confirmed = confirm(`Are you sure you want to delete "${postTitle}"?`);

  if (!confirmed) {
    return false;
  }

  try {
    const { data, errors, statusCode } = await deletePost(postId);

    if (errors) {
      throw new Error(errors[0].message);
    }

    if (statusCode >= 400) {
      throw new Error(`Failed to delete post (${statusCode})`);
    }

    alert('Post deleted successfully!');

    // Return true to indicate successful deletion
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    alert('Error deleting post: ' + error.message);
    return false;
  }
}

/**
 * Attaches delete handlers to delete buttons in the DOM
 * @param {string} buttonSelector - CSS selector for delete buttons
 * @param {Function} onSuccessCallback - Callback function to execute after successful deletion
 */
export function setupDeleteButtons(buttonSelector = '.delete-post-btn', onSuccessCallback = () => window.location.href = '/') {
  document.querySelectorAll(buttonSelector).forEach(button => {
    const postId = button.dataset.postId;
    const postTitle = button.dataset.postTitle || 'this post';

    if (!postId) {
      console.warn('Delete button found without post ID', button);
      return;
    }

    button.addEventListener('click', async (event) => {
      event.preventDefault();
      const success = await onDeletePost(postId, postTitle);

      if (success && typeof onSuccessCallback === 'function') {
        onSuccessCallback();
      }
    });
  });
}
