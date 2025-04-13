import { authGuard, getCurrentUser } from "../../utilities/authGuard";
import { readProfile } from "../../api/profile/read.js";
import { getKey } from "../../api/auth/key.js";

authGuard();

(async function () {
  const currentUser = getCurrentUser();
  const username = currentUser.name;

  // Get the profile data
  const { data: profile } = await readProfile(username);

  if (profile) {
    // Update profile display with data from the API
    if (profile.banner) {
      document.getElementById("banner").src = profile.banner.url;
      document.getElementById("banner").alt = profile.banner.alt;
    }

    if (profile.avatar) {
      document.getElementById("avatar").src = profile.avatar.url;
      document.getElementById("avatar").alt = profile.avatar.alt;
    }

    document.getElementById("name").textContent = profile.name;
    document.getElementById("email").textContent = profile.email;

    // Update bio
    document.getElementById("bio").textContent = profile.bio || "No bio provided";

    // Update follower statistics
    document.getElementById("followers-count").textContent = profile._count?.followers || 0;
    document.getElementById("following-count").textContent = profile._count?.following || 0;
  }
})();


// Handle API key generation
// const apiKeyButton = document.getElementById("api-key-btn");

// apiKeyButton.addEventListener("click", async () => {
//   const { data, errors, statusCode } = await getKey("default");
//   console.log(data, errors, statusCode);
//   if (data) {
//     const apiKey = data.key;
//     const apiKeyElement = document.getElementById("api-key");
//     apiKeyElement.textContent = apiKey;
//     apiKeyElement.style.display = "block";
//     apiKeyButton.style.display = "none";
//     alert("API key generated successfully. Please copy it before refreshing the page.");
//   } else if (errors) {
//     console.error("Error generating API key:", errors[0].message);
//     alert(`Error: ${errors[0].message}`);
//   } else {
//     console.error("Unexpected error:", statusCode);
//     alert("An unexpected error occurred. Please try again.");
//   }
// });
