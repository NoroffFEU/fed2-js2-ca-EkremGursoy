import { updatePost } from "../../api/post/update";
import { readPost } from "../../api/post/read";

/**
 * Loads post data into the edit form
 * @param {string} postId - The ID of the post to edit
 */
export async function loadPostForEdit(postId) {
  try {
    const { data: post, errors } = await readPost(postId);

    if (errors) {
      throw new Error(errors[0].message);
    }

    if (!post) {
      throw new Error('Post not found');
    }

    // Fill form with post data
    const form = document.querySelector('form[name="editPost"]');
    if (!form) {
      throw new Error('Edit form not found');
    }

    // Set form values
    form.elements.title.value = post.title || '';
    form.elements.body.value = post.body || '';

    // Handle tags - convert array to comma-separated string
    if (post.tags && Array.isArray(post.tags)) {
      form.elements.tags.value = post.tags.join(', ');
    }

    // Handle image URL if exists
    if (post.media && post.media.url) {
      form.elements.image.value = post.media.url;
    }

    // Store post ID in a data attribute for reference when submitting
    form.dataset.postId = postId;

    return post;
  } catch (error) {
    console.error('Error loading post for edit:', error);
    alert('Failed to load post: ' + error.message);

    // Redirect back or to homepage if post can't be loaded
    window.location.href = '/';
    return null;
  }
}

/**
 * Handle post update form submission
 * @param {Event} event - The form submit event
 */
export async function onUpdatePost(event) {
  event.preventDefault();

  // Get form and extract post ID
  const form = event.target;
  const postId = form.dataset.postId;

  if (!postId) {
    alert('Post ID is missing. Cannot update.');
    return;
  }

  try {
    // Extract form data
    const formData = new FormData(form);
    const title = formData.get('title').trim();
    const body = formData.get('body').trim();
    const tagsString = formData.get('tags').trim();
    const imageUrl = formData.get('image').trim();

    // Validate required fields
    if (!title) {
      throw new Error('Title is required');
    }

    if (!body) {
      throw new Error('Body content is required');
    }

    // Format tags to array
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Create media object if URL is provided
    const media = imageUrl ? { url: imageUrl } : null;

    // Call API to update the post
    const { data, errors } = await updatePost(postId, {
      title,
      body,
      tags,
      media
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    alert('Post updated successfully!');

    // Redirect to post view
    window.location.href = `/post/?id=${postId}`;

  } catch (error) {
    console.error('Error updating post:', error);
    alert('Error updating post: ' + error.message);
  }
}
