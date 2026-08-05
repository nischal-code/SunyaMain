import { Outlet } from "react-router-dom";

/**
 * AuthLayout
 * Shell for every public/auth route (login, register, forgot password,
 * reset password, OTP verification). Each auth page already renders its
 * form inside components/auth/AuthCard.jsx, which owns the actual
 * centered-card visual treatment — this layout just gives the public
 * route tree a dedicated element to hang route-level concerns off of
 * (e.g. a future marketing header), mirroring DashboardLayout's role for
 * the authenticated tree.
 *
 * Usage (see routes/AppRoutes.jsx):
 *   <Route element={<PublicRoute />}>
 *     <Route element={<AuthLayout />}>
 *       <Route path="/login" element={<LoginPage />} />
 *       ...
 *     </Route>
 *   </Route>
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
