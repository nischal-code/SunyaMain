import { useState } from "react";

/**
 * Tabs
 * Controlled or uncontrolled tab navigation. Pass `activeTab` +
 * `onChange` to control it externally (e.g. syncing with a query
 * param), or omit them to let Tabs manage its own state.
 *
 * Props:
 *  - tabs:       { id, label, icon?, disabled? }[] — required
 *  - activeTab:  string — controlled active tab id
 *  - defaultTab: string — initial tab id when uncontrolled, default tabs[0].id
 *  - onChange:   fn(tabId)
 *  - variant:    "underline" | "pills" — default "underline"
 */
const Tabs = ({
  tabs = [],
  activeTab,
  defaultTab,
  onChange,
  variant = "underline",
  className = "",
}) => {
  const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.id);
  const isControlled = activeTab !== undefined;
  const currentTab = isControlled ? activeTab : internalTab;

  const handleSelect = (tabId) => {
    if (!isControlled) setInternalTab(tabId);
    onChange?.(tabId);
  };

  if (variant === "pills") {
    return (
      <div className={`inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            disabled={tab.disabled}
            onClick={() => handleSelect(tab.id)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              currentTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-6 border-b border-gray-200 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          disabled={tab.disabled}
          onClick={() => handleSelect(tab.id)}
          className={`relative -mb-px flex items-center gap-1.5 border-b-2 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            currentTab === tab.id
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
