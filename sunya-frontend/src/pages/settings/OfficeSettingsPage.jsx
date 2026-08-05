import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import * as settingsApi from "../../api/settings.api";

import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import OfficeTimingForm from "../../components/settings/OfficeTimingForm";
import GracePeriodForm from "../../components/settings/GracePeriodForm";
import MinWorkingHoursForm from "../../components/settings/MinWorkingHoursForm";

const VIEW_ROLES = ["super_admin", "admin", "manager"];
const EDIT_ROLES = ["super_admin", "admin"];

/**
 * OfficeSettingsPage
 * Org-wide office-timing / attendance-rules screen —
 * GET /settings (super_admin/admin/manager) and PATCH /settings
 * (super_admin/admin only) via the three settings forms below.
 * Managers can view the current values but the forms render read-only
 * for them since they aren't allowed to save changes server-side.
 */
const OfficeSettingsPage = () => {
  const { user: currentUser } = useAuth();
  const canView = VIEW_ROLES.includes(currentUser?.role);
  const canEdit = EDIT_ROLES.includes(currentUser?.role);

  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canView) {
      setIsLoading(false);
      return undefined;
    }

    let isMounted = true;
    setIsLoading(true);
    setError("");

    settingsApi
      .getSettings()
      .then((res) => {
        if (!isMounted) return;
        setSettings(res?.data?.data?.settings ?? null);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.response?.data?.message || "Unable to load office settings.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [canView]);

  const handleSaved = (updated) => {
    if (updated) setSettings(updated);
  };

  if (!canView) {
    return (
      <Card>
        <p className="py-6 text-center text-sm text-gray-500">
          You don't have permission to view office settings.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Office Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Office timing and attendance rules applied across the organization.
          {!canEdit && " You can view these settings, but only admins can change them."}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : (
        <div className="space-y-6">
          <OfficeTimingForm settings={settings} canEdit={canEdit} onSaved={handleSaved} />
          <GracePeriodForm settings={settings} canEdit={canEdit} onSaved={handleSaved} />
          <MinWorkingHoursForm settings={settings} canEdit={canEdit} onSaved={handleSaved} />
        </div>
      )}
    </div>
  );
};

export default OfficeSettingsPage;
