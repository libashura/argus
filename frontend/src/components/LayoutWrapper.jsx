'use client';

import { Sidebar } from './Sidebar';

export function LayoutWrapper({ children }) {
  return (
    <div className="container-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
