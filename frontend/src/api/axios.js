import axios from "axios";

// All requests go to the Flask API. `withCredentials: true` is required
// so the browser sends/receives the session cookie Flask-Login uses --
// without this, login would appear to work but you'd get logged out on
// every page refresh.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;
