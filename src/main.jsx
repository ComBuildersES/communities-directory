import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.jsx";

createRoot(document.getElementById("search_app")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
