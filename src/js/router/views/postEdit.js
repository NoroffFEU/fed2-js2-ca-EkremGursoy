import { authGuard, getCurrentUser } from "../../utilities/authGuard";
import { loadPostForEdit, onUpdatePost } from "../../ui/post/update";

// Check if user is logged in
authGuard();

// Initialize post edit page
(async function () {
  // Get post ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  if (!postId) {
    showError('No post ID provided');
    return;
  }

  try {
    // Load post data into form
    const post = await loadPostForEdit(postId);

    if (!post) {
      // Error already handled in loadPostForEdit
      return;
    }

    // Show form container
    const loadingElement = document.getElementById('post-loading');
    const formContainer = document.getElementById('edit-form-container');

    loadingElement.classList.add('hidden');
    formContainer.classList.remove('hidden');

    // Set up image preview if there's already an image URL
    const imageInput = document.getElementById('image');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');

    if (imageInput.value && imagePreview && previewContainer) {
      imagePreview.src = imageInput.value;
      previewContainer.classList.remove('hidden');
    }

    // Add form submit handler
    const form = document.querySelector('form[name="editPost"]');
    form.addEventListener('submit', onUpdatePost);

  } catch (error) {
    console.error('Error initializing post edit:', error);
    showError('Failed to load post for editing');
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
