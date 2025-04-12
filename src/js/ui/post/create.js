import { createPost } from "../../api/post/create";

export async function onCreatePost(event) {
  event.preventDefault();

  // Get form and create feedback element
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
    const result = await createPost({
      title,
      body,
      tags,
      media
    });

    // // Reset form
    // form.reset();

    alert('Post created successfully!');

  } catch (error) {
    // Handle error
    console.error('Error creating post:', error);
    alert('Error creating post: ' + error.message);
  }
}
