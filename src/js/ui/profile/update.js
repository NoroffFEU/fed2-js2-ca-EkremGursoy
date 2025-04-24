import { getCurrentUser } from "../../utilities/authGuard";
import { readProfile } from "../../api/profile/read";
import { updateProfile } from "../../api/profile/update";

/**
 * Loads profile data into edit form
 */
export async function loadProfileForEdit() {
  const currentUser = getCurrentUser();
  const username = currentUser.name;

  try {
    // Get the profile data
    const { data: profile, errors } = await readProfile(username);

    if (errors) {
      throw new Error(errors[0].message);
    }

    if (profile) {
      // Pre-fill form with current profile data
      document.getElementById("edit-bio").value = profile.bio || "";

      if (profile.avatar) {
        document.getElementById("edit-avatar-url").value = profile.avatar.url || "";
        document.getElementById("edit-avatar-alt").value = profile.avatar.alt || "";
      }

      if (profile.banner) {
        document.getElementById("edit-banner-url").value = profile.banner.url || "";
        document.getElementById("edit-banner-alt").value = profile.banner.alt || "";
      }
    }

    return profile;
  } catch (error) {
    console.error("Error loading profile for edit:", error);
    alert('Failed to load profile: ' + error.message);
    return null;
  }
}

/**
 * Handles profile update form submission
 * @param {Event} event - The form submit event
 */
export async function onUpdateProfile(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  const username = currentUser.name;

  try {
    const formData = {
      bio: document.getElementById("edit-bio").value,
      avatar: {
        url: document.getElementById("edit-avatar-url").value,
        alt: document.getElementById("edit-avatar-alt").value
      },
      banner: {
        url: document.getElementById("edit-banner-url").value,
        alt: document.getElementById("edit-banner-alt").value
      }
    };

    const { data, errors } = await updateProfile(username, formData);

    if (errors) {
      throw new Error(errors[0].message);
    }

    if (data) {
      // Update local storage with new profile data
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert('Profile updated successfully!');

      // Redirect to profile page
      window.location.href = "/profile/";
    }
  } catch (error) {
    console.error("Failed to update profile", error);
    alert("Error updating profile: " + error.message);
  }
}
