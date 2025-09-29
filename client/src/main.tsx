import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { unregisterSW } from "./utils/pwa";

// Unregister any existing service workers to prevent caching issues during development
unregisterSW().then(() => {
  console.log('Service worker unregistered to allow fresh updates');
});

createRoot(document.getElementById("root")!).render(<App />);
