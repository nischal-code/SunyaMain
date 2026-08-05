import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";

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
  const location = useLocation();
  const wrapRef = useRef(null);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" }
      );
    }, node);

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div ref={wrapRef}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
