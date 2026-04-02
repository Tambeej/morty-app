import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function PageLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-navy flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
        <Navbar onMenuToggle={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8 animate-fade-in" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
