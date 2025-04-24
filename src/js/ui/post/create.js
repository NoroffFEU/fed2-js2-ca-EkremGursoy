import { createPost } from "../../api/post/create";

/**
 * Handle post creation form submission
 * @param {Event} event - The form submit event
 */
export async function onCreatePost(event) {
  event.preventDefault();

  // Get form
  const form = event.target;

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

    // Call API
    const { data, errors, statusCode } = await createPost({
      title,
      body,
      tags,
      media
    });

    if (errors) {
      throw new Error(errors[0].message);
    }

    if (statusCode >= 400) {
      throw new Error(`Failed to create post (${statusCode})`);
    }

    alert('Post created successfully!');

    // Redirect to home or post view if ID is available
    if (data && data.id) {
      window.location.href = `/post/?id=${data.id}`;
    } else {
      window.location.href = '/';
    }
  } catch (error) {
    // Handle error
    console.error('Error creating post:', error);
    alert('Error creating post: ' + error.message);
  }
}
