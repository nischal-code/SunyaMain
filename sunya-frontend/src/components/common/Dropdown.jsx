import { useEffect, useRef, useState } from "react";

/**
 * Dropdown
 * Generic click-to-open menu anchored to a trigger element. Closes on
 * outside click, Escape, or item selection.
 *
 * Props:
 *  - trigger: node — required, the element that toggles the menu
 *      (rendered inside a <button> wrapper so it stays keyboard-accessible)
 *  - items:   { label, onClick, icon?, danger?, disabled?, key? }[] — required
 *  - align:   "left" | "right" — menu alignment relative to the trigger, default "right"
 */
const Dropdown = ({ trigger, items = [], align = "right", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex items-center"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`absolute z-20 mt-2 min-w-[10rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          {items.map((item, index) => (
            <button
              key={item.key || item.label || index}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setIsOpen(false);
                item.onClick?.();
              }}
              className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
