import { useCallback, useEffect, useState } from "react";
import * as sessionApi from "../../api/session.api";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import { useNotification } from "../../context/NotificationContext";
import { getErrorMessage } from "../../utils/apiErrorHandler";
import { formatDateTime } from "../../utils/formatDate";

/**
 * MySessionsPage
 * Route: /profile/sessions
 * GET /sessions, DELETE /sessions/:sessionId, DELETE /sessions/all-others.
 */
const MySessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  const { notify } = useNotification();

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await sessionApi.getSessions();
      setSessions(data?.data?.sessions ?? data?.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your sessions."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleRevoke = async (sessionId) => {
    setRevokingId(sessionId);
    try {
      await sessionApi.revokeSession(sessionId);
      setSessions((current) => current.filter((session) => session._id !== sessionId));
      notify({ variant: "success", message: "Session revoked." });
    } catch (err) {
      notify({ variant: "error", message: getErrorMessage(err, "Unable to revoke that session.") });
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    setIsRevokingAll(true);
    try {
      await sessionApi.revokeAllOtherSessions();
      notify({ variant: "success", message: "All other sessions were signed out." });
      await loadSessions();
    } catch (err) {
      notify({ variant: "error", message: getErrorMessage(err, "Unable to revoke other sessions.") });
    } finally {
      setIsRevokingAll(false);
    }
  };

  const renderBody = () => {
    if (isLoading) return <Loader text="Loading your sessions…" />;
    if (error) return <ErrorState message={error} onRetry={loadSessions} />;
    if (sessions.length === 0) {
      return <EmptyState title="No active sessions" message="You aren't signed in anywhere else." />;
    }

    return (
      <ul className="divide-y divide-gray-100">
        {sessions.map((session) => (
          <li key={session._id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-gray-800">
                  {session.userAgent || session.device || "Unknown device"}
                </p>
                {session.isCurrent && (
                  <Badge variant="success" size="sm">
                    Current
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-400">
                {session.ipAddress ? `${session.ipAddress} — ` : ""}
                Last active {formatDateTime(session.lastActiveAt || session.updatedAt || session.createdAt)}
              </p>
            </div>

            {!session.isCurrent && (
              <Button
                variant="outline"
                size="sm"
                isLoading={revokingId === session._id}
                onClick={() => handleRevoke(session._id)}
              >
                Revoke
              </Button>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card
        title="My sessions"
        subtitle="Devices and browsers currently signed in to your account."
        actions={
          sessions.length > 1 && (
            <Button variant="outline" size="sm" isLoading={isRevokingAll} onClick={handleRevokeAllOthers}>
              Sign out other sessions
            </Button>
          )
        }
      >
        {renderBody()}
      </Card>
    </div>
  );
};

export default MySessionsPage;
