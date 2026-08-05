import axios from "axios";

/**
 * Base URL for the Sunya backend API (Phase 2C-6).
 * Set VITE_API_BASE_URL in your .env file — defaults to local dev server.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const ACCESS_TOKEN_STORAGE_KEY = "sunya_access_token";

/* ------------------------------------------------------------------ */
/* Access token store                                                  */
/*                                                                      */
/* The access token is kept in memory for fast access on every request */
/* and mirrored to localStorage so a page refresh doesn't immediately  */
/* log the user out (the httpOnly refresh-token cookie is still the    */
/* real source of truth and is validated by the backend on refresh).   */
/* ------------------------------------------------------------------ */
let inMemoryAccessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || null;

export const getAccessToken = () => inMemoryAccessToken;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
};

export const clearAccessToken = () => setAccessToken(null);

/* ------------------------------------------------------------------ */
/* Axios instance                                                      */
/* ------------------------------------------------------------------ */
const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send the httpOnly refreshToken/accessToken cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the in-memory access token to every outgoing request.
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ------------------------------------------------------------------ */
/* Refresh-token handling                                              */
/*                                                                      */
/* On a 401 response we attempt a single silent refresh using the      */
/* httpOnly refreshToken cookie, then retry the original request once. */
/* Concurrent 401s are queued so only one refresh call is in flight.   */
/* ------------------------------------------------------------------ */
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
};

// Callback the app can register (via AuthContext) to react to a forced logout,
// e.g. when the refresh token itself has expired.
let onAuthExpired = () => {};
export const setOnAuthExpired = (callback) => {
  onAuthExpired = typeof callback === "function" ? callback : () => {};
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request until the in-flight refresh finishes.
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axiosClient.post("/auth/refresh-token");
        const newAccessToken = data?.data?.accessToken;

        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        onAuthExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
