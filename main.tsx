import { createRoot } from "react-dom/client";
import App from "./App.js"; // Ensure the extension matches your converted App file
import "./index.css"; // Import global Tailwind styles

// The "!" operator is removed for standard JavaScript compatibility
const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(<App />);
}