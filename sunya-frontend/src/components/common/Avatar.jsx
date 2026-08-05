import { useState } from "react";

const SIZE_CLASSES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

const COLOR_PALETTE = [
  "bg-primary-100 text-primary-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-purple-100 text-purple-700",
];

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const getColorFromName = (name = "") => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return COLOR_PALETTE[sum % COLOR_PALETTE.length];
};

/**
 * Avatar
 * User avatar with image support and an initials fallback when no image
 * is available or the image fails to load.
 *
 * Props:
 *  - src:     string — image URL
 *  - name:    string — used for the initials fallback + alt text
 *  - size:    "xs" | "sm" | "md" | "lg" | "xl" — default "md"
 *  - status:  "online" | "offline" | "away" — optional presence dot
 */
const Avatar = ({ src, name = "", size = "md", status, className = "" }) => {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;

  const statusColor =
    status === "online" ? "bg-green-500" : status === "away" ? "bg-amber-500" : "bg-gray-300";

  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt={name || "Avatar"}
          onError={() => setImgError(true)}
          className={`rounded-full object-cover ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}
        />
      ) : (
        <span
          className={`flex items-center justify-center rounded-full font-semibold ${getColorFromName(
            name
          )} ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}
        >
          {getInitials(name)}
        </span>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${statusColor} ${
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"
          }`}
        />
      )}
    </span>
  );
};

export default Avatar;
