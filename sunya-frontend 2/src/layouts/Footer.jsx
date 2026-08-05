/**
 * Footer
 * Minimal app footer shown at the bottom of the dashboard content area.
 */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-1.5 text-xs text-gray-400 sm:flex-row">
        <p>&copy; {year} Sunya. All rights reserved.</p>
        <p>Phase 2C-6</p>
      </div>
    </footer>
  );
};

export default Footer;
