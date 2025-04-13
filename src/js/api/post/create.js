import { getCurrentUser } from "../../utilities/authGuard";


/**
 * Creates a new post
 * @param {Object} postData - The post data
 * @param {string} postData.title - The post title
 * @param {string} postData.body - The post body content
 * @param {string[]} postData.tags - Array of tags
 * @param {Object} postData.media - Media object with url
 * @returns {Promise<Object>} - The created post
 */
export async function createPost({ title, body, tags = [], media = null }) {

  // Get user data from local storage or context
  const { accessToken } = getCurrentUser();

  // Validate inputs
  if (!title || typeof title !== 'string') {
    throw new Error('Title is required and must be a string');
  }

  if (!body || typeof body !== 'string') {
    throw new Error('Body is required and must be a string');
  }

  if (!Array.isArray(tags)) {
    throw new Error('Tags must be an array');
  }

  // In a real application, this would be a fetch call to an API
  try {
    console.log("Creating post with data:", { title, body, tags, media });


    // Generate post data
    const post = {
      title,
      body,
      tags,
      image: media,
    };

    // Here you would normally POST to an API
    const response = await fetch('https://v2.api.noroff.dev/social/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(post)
    });

    const data = await response.json();

    console.log(data)

    return post;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to create post: ' + error.message);
  }
}
