// One place for every call to the HRMS backend.
// - Sends the login cookie (credentials: "include"); the token itself is never visible to the app.
// - Unwraps the backend's { success, statusCode, message, data } and returns `data`.
// - Throws ApiError (status + the backend's message, ready to show) for any failure.
// - A 401 means the session is gone: the registered handler clears the login state.

// In development Vite proxies /api to the backend (vite.config.js); in production set VITE_API_BASE
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

let onUnauthorized = () => {};

// Called once at start-up (main.jsx) so the client does not import the store itself
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const toQuery = (query) => {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.append(key, value);
  }
  const text = params.toString();
  return text ? `?${text}` : "";
};

const request = async (method, path, { body, query, signal } = {}) => {
  const isForm = body instanceof FormData;
  let response;

  try {
    response = await fetch(API_BASE + path + toQuery(query), {
      method,
      credentials: "include",
      headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // Login and password checks answer 401 for a wrong password; that is not a lost session
    if (response.status === 401 && !path.startsWith("/auth/login") && !path.startsWith("/auth/password")) {
      onUnauthorized();
    }
    throw new ApiError(response.status, payload?.message || `Request failed (${response.status})`, payload);
  }

  return payload?.data ?? null;
};

// Excel and other file downloads: saves the file under the name the server gives it
export const download = async (path, query) => {
  const response = await fetch(API_BASE + path + toQuery(query), { credentials: "include" });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    if (response.status === 401) onUnauthorized();
    throw new ApiError(response.status, payload?.message || `Download failed (${response.status})`, payload);
  }
  const name = response.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] || "download";
  const url = URL.createObjectURL(await response.blob());
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click();
  URL.revokeObjectURL(url);
};

export const api = {
  get: (path, query, options) => request("GET", path, { query, ...options }),
  post: (path, body, options) => request("POST", path, { body, ...options }),
  patch: (path, body, options) => request("PATCH", path, { body, ...options }),
  put: (path, body, options) => request("PUT", path, { body, ...options }),
  delete: (path, options) => request("DELETE", path, options),
};
