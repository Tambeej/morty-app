import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * PageLayout — authenticated page wrapper with sidebar + navbar.
 * Handles responsive sidebar collapse.
 */
const PageLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — hidden on mobile unless open */}
      <div
        className={`
          fixed md:relative z-40 md:z-auto h-full
          transition-transform duration-300
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuToggle={() => setMobileSidebarOpen((v) => !v)} />
        <main
          className="flex-1 overflow-y-auto p-6 md:p-8"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PageLayout;
