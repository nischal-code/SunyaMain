import { useState } from "react";

const POSITION_CLASSES = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

/**
 * Tooltip
 * Wraps any element and shows a small floating label on hover/focus.
 *
 * Props:
 *  - content:  string | node — required, tooltip body (nothing renders if falsy)
 *  - position: "top" | "bottom" | "left" | "right" — default "top"
 *  - children: node — required, the trigger element
 */
const Tooltip = ({ content, position = "top", children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!content) return children;

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-30 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm ${
            POSITION_CLASSES[position] || POSITION_CLASSES.top
          }`}
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
