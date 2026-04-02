/**
 * PageLayout - Authenticated page wrapper with sidebar and navbar.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function PageLayout({ children, title }) {
  return (
    <div className="flex" style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar title={title} />
        <main
          className="flex-1 p-8"
          style={{ background: '#0f172a' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
};
