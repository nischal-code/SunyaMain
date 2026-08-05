/**
 * Spinner
 * Small inline loading indicator (a spinning ring). Used standalone or
 * composed into other components like Button and Loader.
 *
 * Props:
 *  - size:      "xs" | "sm" | "md" | "lg" — default "md"
 *  - className: string — extra classes; include a "text-*" class to
 *      override the default primary color (e.g. "text-current", "text-white")
 */
const SIZE_CLASSES = {
  xs: "h-3.5 w-3.5 border-[1.5px]",
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
};

const Spinner = ({ size = "md", className = "" }) => {
  const hasCustomColor = className.includes("text-");

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${
        SIZE_CLASSES[size] || SIZE_CLASSES.md
      } ${hasCustomColor ? "" : "text-primary-600"} ${className}`}
    />
  );
};

export default Spinner;
