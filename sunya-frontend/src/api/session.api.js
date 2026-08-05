import axiosClient from "./axiosClient";

/**
 * Session API
 * Maps to /api/v1/sessions/* (session.routes.js). All routes require an
 * authenticated request.
 */

// GET /sessions
export const getSessions = () => axiosClient.get("/sessions");

// DELETE /sessions/:sessionId
export const revokeSession = (sessionId) => axiosClient.delete(`/sessions/${sessionId}`);

// DELETE /sessions/all-others
// Bonus helper matching the backend's "revoke everything but this session" route.
export const revokeAllOtherSessions = () => axiosClient.delete("/sessions/all-others");

export default {
  getSessions,
  revokeSession,
  revokeAllOtherSessions,
};
