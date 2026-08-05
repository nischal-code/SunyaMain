import { createContext, useContext, useMemo } from "react";
import useSocket from "../hooks/useSocket";

/**
 * SocketContext
 * Thin context wrapper around the useSocket() hook so the single
 * underlying connection (and its isConnected flag) can be read from
 * anywhere in the tree without every consumer re-running the connection
 * lifecycle itself. Mount <SocketProvider> once, near the root, inside
 * <AuthProvider> (it needs isAuthenticated to know when to connect).
 */
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketState = useSocket();

  const value = useMemo(() => socketState, [socketState]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a <SocketProvider>");
  }
  return context;
};

export default SocketContext;
