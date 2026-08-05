import Spinner from "./Spinner";

const VARIANT_CLASSES = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500/40 disabled:hover:bg-primary-600",
  secondary:
    "bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-400/40 disabled:hover:bg-gray-100",
  outline:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-primary-500/30 disabled:hover:bg-white",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400/30 disabled:hover:bg-transparent",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40 disabled:hover:bg-red-600",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-5 py-3 text-base gap-2",
};

/**
 * Button
 * Generic button used across the app.
 *
 * Props:
 *  - variant:    "primary" | "secondary" | "outline" | "ghost" | "danger" — default "primary"
 *  - size:       "sm" | "md" | "lg" — default "md"
 *  - isLoading:  bool — shows a spinner and disables the button
 *  - fullWidth:  bool — stretches to 100% width
 *  - leftIcon / rightIcon: node — optional icon rendered beside the label
 *  - type:       "button" | "submit" | "reset" — default "button"
 *  - className:  string — extra classes
 *  - ...rest passed through to the underlying <button>
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = "button",
  className = "",
  disabled = false,
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary
      } ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {isLoading && <Spinner size={size === "lg" ? "md" : "sm"} className="text-current" />}
      {!isLoading && leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export default Button;
