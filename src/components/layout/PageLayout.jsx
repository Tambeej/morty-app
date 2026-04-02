/**
 * Page Layout Component
 * Wraps authenticated pages with sidebar and navbar
 */

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * @param {React.ReactNode} children - Page content
 */
const PageLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto p-6 lg:p-8"
          id="main-content"
        >
          <div className="max-w-7xl mx-auto page-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
