/**
 * Card
 * Generic bordered content container used across dashboard, settings,
 * list, and detail screens.
 *
 * Props:
 *  - title / subtitle: string — optional header text
 *  - actions:  node — optional element(s) aligned to the header's right side
 *  - footer:   node — optional footer content
 *  - padding:  bool — default true, set false for edge-to-edge content (e.g. a Table)
 *  - className: string — extra classes on the outer wrapper
 */
const Card = ({ title, subtitle, actions, footer, padding = true, className = "", children }) => {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className={padding ? "p-6" : ""}>{children}</div>

      {footer && <div className="border-t border-gray-100 px-6 py-4">{footer}</div>}
    </div>
  );
};

export default Card;
