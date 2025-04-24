import { onCreatePost } from "../../ui/post/create";
import { authGuard } from "../../utilities/authGuard";
import "../../../css/postCreate.css";

authGuard();

const form = document.forms.createPost;

form.addEventListener("submit", onCreatePost);
