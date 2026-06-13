'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CommandPalette from './ui/CommandPalette';
import ToastContainer from './ui/Toast';

export default function DashboardLayoutClient({
  children,
  user
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string; };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} user={user} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[280px] min-h-screen">
        <Navbar onMenuClick={() => setSidebarOpen(true)} user={user} />
        
        <main className="flex-1 p-6 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer />

      {/* Command Palette */}
      <CommandPalette />
    </div>
  );
}
