'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <div className="sidebar-container">
      <div style={{ padding: '2rem 1.5rem' }}>
        {/* Logo */}
        <div style={{ marginBottom: '3rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                🛡️
              </div>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#f3f4f6',
                  letterSpacing: '-0.5px',
                }}
              >
                Argus
              </span>
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                marginLeft: '48px',
              }}
            >
              Security Scanner
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ marginBottom: '2rem' }}>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  color: isActive('/') ? 'white' : '#9ca3af',
                  textDecoration: 'none',
                  backgroundColor: isActive('/') ? '#3b82f6' : 'transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  if (!isActive('/')) {
                    e.target.style.backgroundColor = '#1f2937';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive('/')) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>📊</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/scan"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  color: isActive('/scan') ? 'white' : '#9ca3af',
                  textDecoration: 'none',
                  backgroundColor: isActive('/scan') ? '#3b82f6' : 'transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => {
                  if (!isActive('/scan')) {
                    e.target.style.backgroundColor = '#1f2937';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive('/scan')) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>🔍</span>
                <span>New Scan</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div
          style={{
            paddingTop: '1rem',
            borderTop: '1px solid #1f2937',
            fontSize: '11px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          v1.0 Beta
        </div>
      </div>
    </div>
  );
}
