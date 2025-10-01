// config.js
export const API_BASE_URL = (() => {
  // می‌تونی بر اساس محیط یا window.location.hostname تغییر بدی
  const host = window.location.hostname;
  if (host.includes("localhost")) return "https://localhost:7032/api";
  if (host.includes("gishot.ir")) return "https://api.gishot.ir";
  if (host.includes("event.gishot.ir")) return "https://event.gishot.ir";
  return "https://localhost:7032/api"; // fallback
})();
