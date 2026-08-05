import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Tabs from "../../components/common/Tabs";
import NotificationList from "../../components/notification/NotificationList";
import NotificationSettingsForm from "../../components/notification/NotificationSettingsForm";

const PAGE_TABS = [
  { id: "notifications", label: "Notifications" },
  { id: "settings", label: "Preferences" },
];

/**
 * NotificationsPage
 * Full notifications center: the paginated, filterable notification list
 * (via NotificationList) plus a preferences tab (NotificationSettingsForm).
 * NotificationDropdown's "Notification settings" link navigates here with
 * `state: { tab: "settings" }` to open directly on the preferences tab.
 */
const NotificationsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    location.state?.tab === "settings" ? "settings" : "notifications"
  );

  const handleSelectNotification = (notification) => {
    if (notification?.link) navigate(notification.link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
        <p className="mt-1 text-sm text-gray-500">
          Stay on top of tasks, projects, and announcements assigned to you.
        </p>
      </div>

      <Tabs tabs={PAGE_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "notifications" ? (
        <Card padding={false}>
          <NotificationList
            pageSize={15}
            className="p-4 sm:p-6"
            onSelectNotification={handleSelectNotification}
          />
        </Card>
      ) : (
        <NotificationSettingsForm />
      )}
    </div>
  );
};

export default NotificationsPage;
