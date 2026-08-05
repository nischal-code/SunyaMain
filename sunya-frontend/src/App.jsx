import { Component } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./store/store";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { SocketProvider } from "./context/SocketContext";
import useSocketEvents from "./sockets/useSocketEvents";
import AppRoutes from "./routes/AppRoutes";
import ServerErrorPage from "./pages/errors/ServerErrorPage";

/**
 * AppErrorBoundary
 * Top-level React error boundary — catches render-time errors anywhere
 * below it and renders ServerErrorPage instead of a blank white screen.
 * Async/API errors are handled per-page (and surfaced via toasts through
 * NotificationContext), so this is a last-resort safety net only.
 */
class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error("Unhandled application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage />;
    }
    return this.props.children;
  }
}

/**
 * SocketEventsBridge
 * Mounts useSocketEvents() once so its effects (subscribing to
 * "notification:new", etc.) run for the lifetime of the app. Rendered
 * inside every provider it depends on (Redux, Socket, Notification).
 */
const SocketEventsBridge = () => {
  useSocketEvents();
  return null;
};

function App() {
  return (
    <AppErrorBoundary>
      <ReduxProvider store={store}>
        <ThemeProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AuthProvider>
                <SocketProvider>
                  <SocketEventsBridge />
                  <AppRoutes />
                </SocketProvider>
              </AuthProvider>
            </BrowserRouter>
          </NotificationProvider>
        </ThemeProvider>
      </ReduxProvider>
    </AppErrorBoundary>
  );
}

export default App;
