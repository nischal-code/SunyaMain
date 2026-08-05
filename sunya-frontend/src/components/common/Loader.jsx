import Spinner from "./Spinner";

/**
 * Loader
 * A larger loading state, either inline within a container or covering
 * the full viewport (e.g. while a page/route is bootstrapping).
 *
 * Props:
 *  - fullScreen: bool   — center within the viewport, default false
 *  - text:       string — optional caption under the spinner
 *  - size:       "sm" | "md" | "lg" — passed through to Spinner, default "lg"
 *  - className:  string — extra classes on the wrapper
 */
const Loader = ({ fullScreen = false, text, size = "lg", className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen w-full" : "py-10"
      } ${className}`}
    >
      <Spinner size={size} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
};

export default Loader;
