/**
 * Page Layout Component
 * Wraps authenticated pages with sidebar and navbar
 */
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function PageLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen bg-navy">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <Navbar onMenuToggle={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />

      <main
        className="transition-all duration-300 pt-16"
        style={{
          marginLeft: sidebarCollapsed ? '4rem' : '15rem',
        }}
      >
        <div className="p-8 page-enter">{children}</div>
      </main>
    </div>
  );
}

export default PageLayout;
