import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

/**
 * Authenticated page shell: sidebar + top navbar + main content area.
 */
export default function PageLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-navy">
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <div className="hidden md:block">
        <Sidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar onMenuToggle={() => setSidebarCollapsed((c) => !c)} />
        <main className="flex-1 p-6 md:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired
};
