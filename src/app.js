import "./css/style.css";
import "./css/layout.css";

import { loadLayout } from "./js/layout/layoutManager";
import router from "./js/router";

await loadLayout();
await router(window.location.pathname);
