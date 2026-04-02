/**
 * PageLayout.jsx
 * Root layout wrapper for authenticated pages.
 * Renders Sidebar (left) + main content area (right).
 */
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const PageLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0f172a',
      }}
    >
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 30,
          }}
          aria-hidden="true"
        />
      )}

      {/* Main area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          // On desktop, offset for the fixed sidebar
          marginLeft: 'var(--sidebar-width, 240px)',
        }}
        className="page-main"
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main
          style={{
            flex: 1,
            padding: '32px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>

      {/* Responsive: collapse sidebar margin on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .page-main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PageLayout;
