/**
 * AuthCard
 *
 * Shared visual shell for every auth screen (login, register, forgot
 * password, reset password, OTP verification, change password).
 *
 * Keeps the branding/layout in one place so individual forms only need
 * to worry about their fields and submit logic.
 *
 * Props:
 *  - title:      string   — main heading (e.g. "Welcome back")
 *  - subtitle:   string   — supporting line under the heading
 *  - children:   node     — the form itself
 *  - footer:     node     — optional footer content (e.g. "Don't have an account? Sign up")
 */
const AuthCard = ({ title, subtitle, children, footer }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white shadow-sm">
            S
          </div>
          <span className="text-sm font-semibold tracking-wide text-gray-500">
            SUNYA
          </span>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {(title || subtitle) && (
            <div className="mb-6 text-center">
              {title && (
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          )}

          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
        )}
      </div>
    </div>
  );
};

export default AuthCard;
