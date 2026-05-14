'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { scanAPI } from '@/lib/api';

const TESTS = [
  { id: 'bola', label: 'BOLA - Broken Object Level Authorization' },
  { id: 'broken_auth', label: 'Broken Authentication' },
  { id: 'rate_limit', label: 'Rate Limiting' },
  { id: 'mass_assignment', label: 'Mass Assignment' },
  { id: 'excessive_exposure', label: 'Excessive Exposure' },
  { id: 'ssrf', label: 'SSRF - Server-Side Request Forgery' },
];

export default function ScanPage() {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState('http://localhost:8001');
  const [authToken, setAuthToken] = useState('');
  const [selectedTests, setSelectedTests] = useState(TESTS.map(t => t.id));
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);

  const handleTestToggle = (testId) => {
    setSelectedTests(prev =>
      prev.includes(testId)
        ? prev.filter(t => t !== testId)
        : [...prev, testId]
    );
  };

  const handleStartScan = async () => {
    if (!targetUrl.trim()) {
      alert('Please enter a target URL');
      return;
    }

    setScanning(true);
    try {
      const response = await scanAPI.createScan(
        targetUrl,
        authToken || undefined,
        selectedTests
      );
      
      setScanId(response.data.scan_id);
      
      const interval = setInterval(async () => {
        try {
          const statusResponse = await scanAPI.getScan(response.data.scan_id);
          setScanStatus(statusResponse.data);
          
          if (statusResponse.data.status === 'complete' || statusResponse.data.status === 'failed') {
            clearInterval(interval);
            setScanning(false);
          }
        } catch (error) {
          console.error('Error polling scan status:', error);
        }
      }, 2000);
      
      setPollInterval(interval);
    } catch (error) {
      console.error('Error starting scan:', error);
      setScanning(false);
      alert('Failed to start scan');
    }
  };

  const handleViewReport = () => {
    if (scanId) {
      router.push(`/report/${scanId}`);
    }
  };

  return (
    <LayoutWrapper>
      <div className="page-container">
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#f3f4f6',
                marginBottom: '0.5rem',
              }}
            >
              New Security Scan
            </h1>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
              Configure and run a security test on your API endpoint
            </p>
          </div>

          {!scanId ? (
            <div className="card">
              <div style={{ marginBottom: '2rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#e5e7eb',
                    marginBottom: '0.5rem',
                  }}
                >
                  Target URL
                </label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={scanning}
                  placeholder="http://localhost:8001"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#0a0f1e',
                    border: '1px solid #1f2937',
                    borderRadius: '6px',
                    color: '#e5e7eb',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                    cursor: scanning ? 'not-allowed' : 'auto',
                    opacity: scanning ? 0.6 : 1,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#1f2937')}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.5rem' }}>
                  Enter the base URL of the API you want to scan
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#e5e7eb',
                    marginBottom: '0.5rem',
                  }}
                >
                  Authentication Token (Optional)
                </label>
                <input
                  type="text"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  disabled={scanning}
                  placeholder="Bearer token if needed"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#0a0f1e',
                    border: '1px solid #1f2937',
                    borderRadius: '6px',
                    color: '#e5e7eb',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease',
                    cursor: scanning ? 'not-allowed' : 'auto',
                    opacity: scanning ? 0.6 : 1,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#1f2937')}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.5rem' }}>
                  If your API requires authentication, provide a valid token
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#e5e7eb',
                    marginBottom: '1rem',
                  }}
                >
                  Security Tests
                </label>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {TESTS.map(test => (
                    <label
                      key={test.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#0a0f1e',
                        border: '1px solid #1f2937',
                        borderRadius: '6px',
                        cursor: scanning ? 'not-allowed' : 'pointer',
                        opacity: scanning ? 0.6 : 1,
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        if (!scanning) {
                          e.currentTarget.style.backgroundColor = '#1f2937';
                        }
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#0a0f1e';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.id)}
                        onChange={() => handleTestToggle(test.id)}
                        disabled={scanning}
                        style={{
                          marginRight: '0.75rem',
                          width: '16px',
                          height: '16px',
                          cursor: scanning ? 'not-allowed' : 'pointer',
                          accentColor: '#3b82f6',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#e5e7eb',
                          fontWeight: '500',
                        }}
                      >
                        {test.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartScan}
                disabled={scanning || !targetUrl.trim()}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: scanning || !targetUrl.trim() ? '#4b5563' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: scanning || !targetUrl.trim() ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={(e) => {
                  if (!scanning && targetUrl.trim()) {
                    e.target.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseOut={(e) => {
                  if (!scanning && targetUrl.trim()) {
                    e.target.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {scanning ? 'Scanning in progress...' : 'Start Scan'}
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                {scanStatus?.status === 'complete' ? (
                  <div style={{ fontSize: '48px' }}>✓</div>
                ) : scanStatus?.status === 'failed' ? (
                  <div style={{ fontSize: '48px' }}>✗</div>
                ) : (
                  <div
                    style={{
                      fontSize: '48px',
                      animation: 'spin 1s linear infinite',
                      display: 'inline-block',
                    }}
                  >
                    ⟳
                  </div>
                )}
              </div>

              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#f3f4f6',
                  marginBottom: '0.5rem',
                  textTransform: 'capitalize',
                }}
              >
                Scan {scanStatus?.status || 'in progress'}
              </h2>

              <p
                style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  marginBottom: '2rem',
                  fontFamily: 'monospace',
                }}
              >
                ID: {scanId}
              </p>

              {scanStatus?.status === 'complete' && (
                <button
                  onClick={handleViewReport}
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
                >
                  View Full Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
}
