import { reactToPost, getReactions } from "../../api/post/react";
import { getCurrentUser } from "../../utilities/authGuard";

// Common emoji reactions
export const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏'];

/**
 * Check if the current user has already reacted with a specific symbol
 * @param {Array} reactions - Array of reactions on the post
 * @param {string} symbol - The reaction symbol to check
 * @param {string} currentUsername - The current user's username
 * @returns {boolean} - Whether the user has already reacted with this symbol
 */
function hasUserReacted(reactions, symbol, currentUsername) {
  if (!reactions || !Array.isArray(reactions) || !currentUsername) {
    return false;
  }

  return reactions.some(reaction => {
    const reactionOwner = reaction.owner || reaction.author;
    return reaction.symbol === symbol &&
      reactionOwner && reactionOwner.name === currentUsername;
  });
}

/**
 * Handles the toggling of reactions on a post
 * @param {string} postId - The ID of the post
 * @param {string} symbol - The emoji reaction symbol
 * @param {Function} onSuccess - Callback function to execute after successful reaction
 * @param {Array} existingReactions - Current reactions on the post
 */
export async function handleReaction(postId, symbol, onSuccess, existingReactions = []) {
  try {
    // Get current user
    const currentUser = getCurrentUser();
    const currentUsername = currentUser ? currentUser.name : '';

    // Check if user has already reacted with this symbol
    const isRemoving = hasUserReacted(existingReactions, symbol, currentUsername);

    // The API toggles reactions automatically via PUT
    // It will add the reaction if it doesn't exist, or remove it if it does
    const result = await reactToPost(postId, symbol);

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    // After the API call, get fresh reaction data to sync the UI
    const refreshResult = await getReactions(postId);

    // Get the updated reactions
    const updatedReactions = refreshResult.data.reactions || [];

    // Determine the new state (after the API call)
    const hasNowReacted = hasUserReacted(updatedReactions, symbol, currentUsername);

    // Call success callback if provided
    if (typeof onSuccess === 'function') {
      // Pass the updated reactions data and whether it was added or removed
      onSuccess(refreshResult.data, symbol, !hasNowReacted, updatedReactions);
    }

    return result.data;
  } catch (error) {
    console.error(`Error handling reaction:`, error);
    alert(`Failed to update reaction: ${error.message}`);
    return null;
  }
}

/**
 * Creates reaction buttons for a post
 * @param {string} postId - The post ID
 * @param {Array} existingReactions - Array of existing reactions
 * @param {string} currentUsername - Current user's username
 * @param {Function} onReactionChange - Callback when reactions change
 * @returns {HTMLElement} - The reaction buttons container
 */
export function createReactionButtons(postId, existingReactions = [], currentUsername = '', onReactionChange = null) {
  // Create container for reaction buttons
  const container = document.createElement('div');
  container.className = 'flex flex-wrap gap-2 mt-4';

  // Process grouped existing reactions into counts and user reactions
  const reactionCounts = {};
  const userReactions = new Set();

  if (existingReactions && Array.isArray(existingReactions)) {
    existingReactions.forEach(r => {
      const symbol = r.symbol;
      const count = r.count || 0;
      reactionCounts[symbol] = count;

      const reactors = Array.isArray(r.reactors) ? r.reactors : [];
      if (reactors.includes(currentUsername)) {
        userReactions.add(symbol);
      }
    });
  }

  // Create buttons for common reactions
  COMMON_REACTIONS.forEach(symbol => {
    const count = reactionCounts[symbol] || 0;
    const hasReacted = userReactions.has(symbol);

    const button = document.createElement('button');
    button.className = `flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${hasReacted
      ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transform scale-110'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`;
    button.id = `reaction-${symbol}`;

    // Add animation effect for the emoji
    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'text-lg transition-transform duration-200';
    emojiSpan.textContent = symbol;

    const countSpan = document.createElement('span');
    countSpan.className = 'reaction-count font-medium';
    countSpan.textContent = count > 0 ? count : '';

    button.appendChild(emojiSpan);
    button.appendChild(countSpan);

    button.title = hasReacted ? `Remove ${symbol} reaction` : `React with ${symbol}`;
    button.dataset.symbol = symbol;
    button.dataset.reacted = hasReacted.toString();

    // Add click handler
    button.addEventListener('click', async () => {
      if (!currentUsername) {
        alert('You need to be logged in to react to posts');
        return;
      }

      // Disable button during API call to prevent double clicks
      button.disabled = true;

      // Add animation effect
      const isRemoving = hasReacted;
      emojiSpan.classList.add(isRemoving ? 'scale-75' : 'scale-150');

      // Reset animation after a short delay
      setTimeout(() => {
        emojiSpan.classList.remove('scale-75', 'scale-150');
      }, 300);

      try {
        // Toggle reaction state - pass current reactions so we know if removing or adding
        await handleReaction(postId, symbol, (data, reactedSymbol, wasRemoved, updatedReactions) => {
          // Update all reaction buttons based on fresh data from server
          if (updatedReactions && Array.isArray(updatedReactions)) {
            updateAllReactionCounts(updatedReactions, currentUsername);

            // Call the reaction change callback with the correct state
            if (onReactionChange) {
              // Check current reaction state in the updated data
              const hasUserReaction = hasUserReacted(updatedReactions, symbol, currentUsername);
              onReactionChange(symbol, hasUserReaction, updatedReactions);
            }
          } else {
            // Fallback to updating just this button
            updateSingleReactionButton(button, !isRemoving, symbol);

            // Call the reaction change callback if provided
            if (onReactionChange) {
              onReactionChange(symbol, !isRemoving, null);
            }
          }
        }, existingReactions);
      } catch (error) {
        console.error('Error handling reaction:', error);
      } finally {
        // Re-enable button
        button.disabled = false;
      }
    });

    container.appendChild(button);
  });

  // Add a message if user is not logged in
  if (!currentUsername) {
    const loginMessage = document.createElement('p');
    loginMessage.className = 'text-xs text-gray-500 mt-2 italic';
    loginMessage.textContent = 'Log in to react to this post';
    container.appendChild(loginMessage);
  }

  return container;
}

/**
 * Update a single reaction button with new state
 * @param {HTMLElement} button - The reaction button to update
 * @param {boolean} hasReacted - Whether user has reacted with this symbol
 * @param {string} symbol - The reaction symbol
 */
function updateSingleReactionButton(button, hasReacted, symbol) {
  // Update button state
  button.dataset.reacted = hasReacted.toString();

  // Update count
  const countElement = button.querySelector('.reaction-count');
  let newCount = parseInt(countElement.textContent || '0');

  if (!hasReacted) {
    newCount = Math.max(0, newCount - 1);
  } else {
    newCount += 1;
  }

  countElement.textContent = newCount > 0 ? newCount.toString() : '';

  // Update button styling
  if (hasReacted) {
    button.className = 'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transform scale-110';
    button.title = `Remove ${symbol} reaction`;
  } else {
    button.className = 'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200';
    button.title = `React with ${symbol}`;
  }
}

/**
 * Update all reaction buttons based on fresh data from server
 * @param {Array} reactions - Array of updated reaction objects
 * @param {string} currentUsername - Current user's username
 */
function updateAllReactionCounts(reactions, currentUsername) {
  const reactionCounts = {};
  const userReactions = new Set();

  if (Array.isArray(reactions)) {
    reactions.forEach(r => {
      const symbol = r.symbol;
      const count = r.count || 0;
      reactionCounts[symbol] = count;

      const reactors = Array.isArray(r.reactors) ? r.reactors : [];
      if (reactors.includes(currentUsername)) {
        userReactions.add(symbol);
      }
    });
  }

  // Update each reaction button with the correct count and state
  COMMON_REACTIONS.forEach(symbol => {
    const button = document.getElementById(`reaction-${symbol}`);
    if (!button) return;

    const count = reactionCounts[symbol] || 0;
    const hasReacted = userReactions.has(symbol);

    // Update button state
    button.dataset.reacted = hasReacted.toString();

    // Update count
    const countElement = button.querySelector('.reaction-count');
    countElement.textContent = count > 0 ? count : '';

    // Update button styling
    if (hasReacted) {
      button.className = 'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transform scale-110';
      button.title = `Remove ${symbol} reaction`;
    } else {
      button.className = 'flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200';
      button.title = `React with ${symbol}`;
    }
  });
}

/**
 * Displays a summary of reactions on a post
 * @param {Array} reactions - Array of reaction objects
 * @returns {HTMLElement} - The reaction summary element
 */
export function createReactionSummary(reactions = []) {
  const container = document.createElement('div');
  container.className = 'flex items-center text-sm text-gray-500 mt-2';

  if (!reactions || !Array.isArray(reactions) || reactions.length === 0) {
    container.textContent = 'No reactions yet';
    return container;
  }

  // Count reactions by symbol
  const reactionCounts = {};
  reactions.forEach(reaction => {
    const symbol = reaction.symbol;
    if (!reactionCounts[symbol]) {
      reactionCounts[symbol] = 0;
    }
    reactionCounts[symbol]++;
  });

  // Create reaction summary text
  const reactionSummary = Object.entries(reactionCounts)
    .map(([symbol, count]) => `${symbol} ${count}`)
    .join('  ');

  container.textContent = reactionSummary;

  return container;
}

/**
 * Set the total reaction count in the UI based on grouped reactions array
 * @param {Array} reactions - The array of grouped reaction objects
 */
function updateTotalReactionCount(reactions) {
  const reactionCountElement = document.getElementById('post-reaction-count');
  if (!reactionCountElement || !Array.isArray(reactions)) return;

  // Sum all counts
  const total = reactions.reduce((sum, r) => sum + (r.count || 0), 0);
  reactionCountElement.textContent = total;
}