import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Remove loader as soon as React paints
const removeLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 400);
  }
};

// Register service worker for PWA (defer to not block rendering)
if ('serviceWorker' in navigator) {
  // Unregister any stale service workers that may serve cached old pages
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.update());
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Remove loader after first paint — use requestAnimationFrame for reliability on iOS
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    removeLoader();
  });
});

// Fallback: force remove after 3 seconds regardless
setTimeout(removeLoader, 3000);
