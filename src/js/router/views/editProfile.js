import { authGuard, getCurrentUser } from "../../utilities/authGuard";
import { readProfile } from "../../api/profile/read.js";
import { updateProfile } from "../../api/profile/update.js";

authGuard();

(async function () {
  const currentUser = getCurrentUser();
  const username = currentUser.name;

  // Get the profile data
  const { data: profile } = await readProfile(username);

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

  // Handle form submission
  document.getElementById("edit-profile-form").addEventListener("submit", async (event) => {
    event.preventDefault();

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

    try {
      const response = await updateProfile(username, formData);

      if (response.data) {
        // Update local storage with new profile data
        const updatedProfile = { ...currentUser, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedProfile));

        // Redirect to profile page
        window.location.href = "/profile/";
      } else if (response.errors) {
        alert(`Error: ${response.errors[0].message}`);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("An unexpected error occurred. Please try again.");
    }
  });
})();