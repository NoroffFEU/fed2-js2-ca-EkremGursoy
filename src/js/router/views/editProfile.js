import { authGuard } from "../../utilities/authGuard";
import { loadProfileForEdit, onUpdateProfile } from "../../ui/profile/update";

// Check if user is logged in
authGuard();

// Load profile data and set up event listener
(async function () {
  await loadProfileForEdit();

  // Attach event listener to form submission
  document.getElementById("edit-profile-form").addEventListener("submit", onUpdateProfile);
})();