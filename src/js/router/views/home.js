import { onLogout } from "../../ui/auth/logout";
import { authGuard } from "../../utilities/authGuard";

authGuard();

const logoutButton = document.getElementById("logout-button");

logoutButton.addEventListener("click", onLogout);

