import { io } from "socket.io-client";
import { getAccessToken } from "../api/axiosClient";

/**
 * socketClient.js
 *
 * Singleton Socket.IO client factory for the Sunya backend's
 * src/socket/index.js. That server authenticates each handshake with
 * `auth.token` (verified via verifyAccessToken) and auto-joins every
 * socket to a `user:<userId>` room, so per-user events like
 * "notification:new" arrive without any extra subscription step.
 *
 * This module owns exactly one socket instance app-wide; SocketContext
 * (src/context/SocketContext.jsx) drives its connect/disconnect
 * lifecycle off of auth state. Prefer the useSocket() hook or
 * SocketContext in components — reach for this module directly only
 * outside of React (or inside those two).
 */

const resolveSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit) return explicit;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  try {
    const { protocol, host } = new URL(apiBaseUrl);
    return `${protocol}//${host}`;
  } catch {
    return apiBaseUrl.replace(/\/api(\/v\d+)?\/?$/, "");
  }
};

let socketInstance = null;

/** Creates the socket (if needed) and connects it using the current access token. */
export const connectSocket = () => {
  if (socketInstance?.connected) return socketInstance;

  if (!socketInstance) {
    socketInstance = io(resolveSocketUrl(), {
      autoConnect: false,
      withCredentials: true,
    });
  }

  socketInstance.auth = { token: getAccessToken() };
  socketInstance.connect();
  return socketInstance;
};

export const disconnectSocket = () => {
  socketInstance?.disconnect();
};

export const getSocket = () => socketInstance;

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
};
