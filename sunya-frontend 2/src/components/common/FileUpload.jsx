import { useRef, useState } from "react";

const formatBytes = (bytes) => {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
};

/**
 * FileUpload
 * Drag-and-drop + click-to-browse file picker with a selected-files
 * list. Does not upload anything itself — it just collects File objects
 * and hands them to `onFilesSelected`, so it can be wired to any upload
 * API (profile picture, task attachments, etc).
 *
 * Props:
 *  - accept:           string — e.g. "image/*", ".pdf,.docx" — default undefined (any)
 *  - multiple:         bool — default false
 *  - maxSizeMB:        number — client-side size guard per file, default undefined (no limit)
 *  - onFilesSelected:  fn(File[]) — required
 *  - helperText:       string — shown under the drop zone
 */
const FileUpload = ({
  accept,
  multiple = false,
  maxSizeMB,
  onFilesSelected,
  helperText,
  className = "",
}) => {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sizeError, setSizeError] = useState("");

  const processFiles = (fileList) => {
    const files = Array.from(fileList);

    if (maxSizeMB) {
      const tooLarge = files.some((file) => file.size > maxSizeMB * 1024 * 1024);
      if (tooLarge) {
        setSizeError(`Each file must be under ${maxSizeMB}MB`);
        return;
      }
    }

    setSizeError("");
    const nextFiles = multiple ? [...selectedFiles, ...files] : files;
    setSelectedFiles(nextFiles);
    onFilesSelected?.(nextFiles);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.length) processFiles(event.dataTransfer.files);
  };

  const removeFile = (index) => {
    const nextFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(nextFiles);
    onFilesSelected?.(nextFiles);
  };

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          isDragging ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12"
          />
        </svg>
        <p className="text-sm font-medium text-gray-700">
          <span className="text-primary-600">Click to upload</span> or drag and drop
        </p>
        {helperText && <p className="mt-1 text-xs text-gray-400">{helperText}</p>}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(event) => event.target.files?.length && processFiles(event.target.files)}
          className="hidden"
        />
      </div>

      {sizeError && <p className="mt-1.5 text-xs text-red-600">{sizeError}</p>}

      {selectedFiles.length > 0 && (
        <ul className="mt-3 space-y-2">
          {selectedFiles.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <span className="truncate text-gray-700">{file.name}</span>
              <span className="ml-3 flex shrink-0 items-center gap-3">
                <span className="text-xs text-gray-400">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.name}`}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUpload;
