import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Avatar from "../components/common/Avatar";
import Dropdown from "../components/common/Dropdown";
import NotificationBell from "../components/notification/NotificationBell";

const MenuIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
    />
  </svg>
);

const LockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a1.5 1.5 0 011.5 1.5v7.5a1.5 1.5 0 01-1.5 1.5h-10.5a1.5 1.5 0 01-1.5-1.5v-7.5a1.5 1.5 0 011.5-1.5z"
    />
  </svg>
);

const SessionsIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M9 17.25v1.5a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-1.5M12 17.25a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H8.25m9.75 0l-3-3m3 3l-3 3"
    />
  </svg>
);

/**
 * Topbar
 * Sticky app header shown above the routed page content. Hosts the
 * mobile sidebar toggle, the notification bell, and the signed-in
 * user's account menu (profile / change password / sessions / logout).
 *
 * Props:
 *  - onMenuClick: fn — opens the mobile Sidebar drawer (hidden on lg+)
 */
const Topbar = ({ onMenuClick = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const accountMenuItems = [
    { key: "profile", label: "My Profile", icon: <ProfileIcon />, onClick: () => navigate("/profile") },
    {
      key: "change-password",
      label: "Change Password",
      icon: <LockIcon />,
      onClick: () => navigate("/profile/change-password"),
    },
    {
      key: "sessions",
      label: "My Sessions",
      icon: <SessionsIcon />,
      onClick: () => navigate("/profile/sessions"),
    },
    { key: "logout", label: "Log Out", icon: <LogoutIcon />, danger: true, onClick: handleLogout },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
        >
          <MenuIcon />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />

        <Dropdown
          align="right"
          items={accountMenuItems}
          trigger={
            <span className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-gray-100">
              <Avatar src={user?.profilePicture} name={user?.name} size="sm" />
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight text-gray-800">
                  {user?.name || "Account"}
                </span>
                <span className="block text-xs leading-tight text-gray-400">{user?.email}</span>
              </span>
            </span>
          }
        />
      </div>
    </header>
  );
};

export default Topbar;
