import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import gsap from "gsap";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";

/**
 * DashboardLayout
 * Shell for every authenticated page: a fixed/drawer Sidebar on the
 * left, a sticky Topbar, a Breadcrumbs trail, the routed page content
 * (via <Outlet />), and a Footer.
 *
 * Intended to be used as the element for the authenticated route tree,
 * e.g.:
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<DashboardLayout />}>
 *       <Route path="/dashboard" element={<DashboardPage />} />
 *       ...
 *     </Route>
 *   </Route>
 */
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const outletWrapRef = useRef(null);

  // Close the mobile drawer automatically on every navigation.
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Page-transition: every routed page fades/slides in on navigation, so
  // the GSAP entrance treatment applies consistently across the whole
  // authenticated app rather than being wired up page-by-page.
  useEffect(() => {
    const node = outletWrapRef.current;
    if (!node) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", clearProps: "transform" }
      );
    }, node);

    return () => ctx.revert();
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Breadcrumbs />
            <div className="mt-4" ref={outletWrapRef}>
              <Outlet />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
