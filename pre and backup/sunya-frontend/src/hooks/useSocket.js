import { useCallback, useEffect, useRef, useState } from "react";
import useAuth from "./useAuth";
import { getAccessToken } from "../api/axiosClient";

/**
 * useSocket
 *
 * Manages a single socket.io connection to the Sunya backend, authenticated
 * the same way the backend's src/socket/index.js middleware expects: a
 * token sent via `auth.token` on the handshake, verified there with
 * verifyAccessToken(). The backend also joins every socket to a
 * `user:<userId>` room, so per-user events (e.g. notifications) arrive
 * without any extra subscription step here.
 *
 * The connection opens once the user is authenticated (per AuthContext)
 * and is torn down on logout/unmount, mirroring the lifecycle already
 * used for the access token in axiosClient.
 *
 * REQUIRES the `socket.io-client` package, which isn't yet in
 * package.json — install it before using this hook:
 *   npm install socket.io-client
 *
 * Socket URL resolution:
 *   Uses VITE_SOCKET_URL if set; otherwise it's derived from
 *   VITE_API_BASE_URL by dropping the "/api/v1" path, since the
 *   backend's initSocket() attaches to the same HTTP server as the
 *   REST API (see src/socket/index.js).
 *
 * Usage:
 *   const { isConnected, on, emit } = useSocket();
 *
 *   useEffect(() => {
 *     const unsubscribe = on("notification:new", (payload) => {
 *       // e.g. bump NotificationContext's unread count
 *     });
 *     return unsubscribe;
 *   }, [on]);
 */

const resolveSocketUrl = () => {
  const explicit = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
  if (explicit) return explicit;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";
  try {
    const { protocol, host } = new URL(apiBaseUrl);
    return `${protocol}//${host}`;
  } catch {
    return apiBaseUrl.replace(/\/api(\/v\d+)?\/?$/, "");
  }
};

export const useSocket = ({ autoConnect = true } = {}) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  // event -> Set<handler>, re-attached every time the socket (re)connects
  // so consumers can call on()/off() without caring about connection state.
  const listenersRef = useRef(new Map());

  const attachAllListeners = useCallback((socket) => {
    listenersRef.current.forEach((handlers, event) => {
      handlers.forEach((handler) => socket.on(event, handler));
    });
  }, []);

  useEffect(() => {
    if (!autoConnect || !isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      return undefined;
    }

    let isCancelled = false;

    import("socket.io-client")
      .then(({ io }) => {
        if (isCancelled) return;

        const socket = io(resolveSocketUrl(), {
          auth: { token: getAccessToken() },
          withCredentials: true,
          autoConnect: true,
        });

        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));
        socket.on("connect_error", () => setIsConnected(false));

        attachAllListeners(socket);
        socketRef.current = socket;
      })
      .catch(() => {
        // socket.io-client isn't installed yet — fail quietly, isConnected
        // just stays false. See the install note in the file header.
        setIsConnected(false);
      });

    return () => {
      isCancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, autoConnect, attachAllListeners]);

  // Subscribe to a socket event; returns an unsubscribe function. Safe to
  // call before the socket has connected — the handler is tracked and
  // attached as soon as the connection is established.
  const on = useCallback((event, handler) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(handler);
    socketRef.current?.on(event, handler);

    return () => {
      listenersRef.current.get(event)?.delete(handler);
      socketRef.current?.off(event, handler);
    };
  }, []);

  const off = useCallback((event, handler) => {
    listenersRef.current.get(event)?.delete(handler);
    socketRef.current?.off(event, handler);
  }, []);

  const emit = useCallback((event, payload) => {
    socketRef.current?.emit(event, payload);
  }, []);

  return { socket: socketRef.current, isConnected, on, off, emit };
};

export default useSocket;
