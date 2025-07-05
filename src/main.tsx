import { createRoot } from "react-dom/client";
import "./index.css";
import { StrictMode } from "react"
import App from "./App";

// biome-ignore lint/style/noNonNullAssertion: The element with id 'root' is guaranteed to exist in the DOM
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
