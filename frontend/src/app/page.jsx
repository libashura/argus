'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { scanAPI } from '@/lib/api';

export default function Dashboard() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScans();
    const interval = setInterval(fetchScans, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchScans = async () => {
    try {
      const response = await scanAPI.listScans();
      setScans(response.data || []);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalScans = scans.length;
  const completedScans = scans.filter(s => s.status === 'complete').length;
  const totalFindings = scans.reduce((sum, s) => sum + (s.total_findings || 0), 0);
  const criticalIssues = scans.reduce((sum, s) => {
    if (s.findings && Array.isArray(s.findings)) {
      return sum + s.findings.filter(f => f.severity === 'CRITICAL').length;
    }
    return sum;
  }, 0);

  const StatCard = ({ icon, label, value }) => (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <span
          style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500',
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#f3f4f6',
        }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <LayoutWrapper>
      <div className="page-container">
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#f3f4f6',
                  marginBottom: '0.5rem',
                }}
              >
                Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                API Security Testing Overview
              </p>
            </div>
            <Link
              href="/scan"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
              onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
            >
              Start New Scan
            </Link>
          </div>

          {/* Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <StatCard icon="📊" label="Total Scans" value={totalScans} />
            <StatCard icon="✓" label="Completed" value={completedScans} />
            <StatCard icon="🔴" label="Total Findings" value={totalFindings} />
            <StatCard icon="⚠️" label="Critical Issues" value={criticalIssues} />
          </div>

          {/* Scans Section */}
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#f3f4f6',
                marginBottom: '1rem',
              }}
            >
              Recent Scans
            </h2>

            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '24px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>
                  ⟳
                </div>
                <p style={{ color: '#9ca3af', marginTop: '1rem', fontSize: '14px' }}>
                  Loading scans...
                </p>
              </div>
            ) : scans.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#f3f4f6',
                    marginBottom: '0.5rem',
                  }}
                >
                  No scans yet
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '1.5rem' }}>
                  Start your first API security scan to identify vulnerabilities
                </p>
                <Link
                  href="/scan"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = '#2563eb')}
                  onMouseOut={(e) => (e.target.style.backgroundColor = '#3b82f6')}
                >
                  Start New Scan
                </Link>
              </div>
            ) : (
              <div
                className="card"
                style={{
                  overflow: 'hidden',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid #1f2937',
                      }}
                    >
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Target URL
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Risk Level
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Findings
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Date
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#9ca3af',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scans.map((scan, idx) => {
                      const statusColors = {
                        complete: { bg: '#10b98150', text: '#10b981', label: 'Complete' },
                        running: { bg: '#3b82f650', text: '#3b82f6', label: 'Running' },
                        failed: { bg: '#ef444450', text: '#ef4444', label: 'Failed' },
                      };

                      const riskColors = {
                        CRITICAL: { bg: '#ef444450', text: '#ef4444', label: 'Critical' },
                        HIGH: { bg: '#f9731650', text: '#f97316', label: 'High' },
                        MEDIUM: { bg: '#eab30850', text: '#eab308', label: 'Medium' },
                        LOW: { bg: '#3b82f650', text: '#3b82f6', label: 'Low' },
                        INFO: { bg: '#6b728050', text: '#9ca3af', label: 'Info' },
                      };

                      const statusColor = statusColors[scan.status] || statusColors.failed;
                      const riskColor = riskColors[scan.overall_risk] || riskColors.INFO;

                      return (
                        <tr
                          key={scan.id}
                          style={{
                            borderBottom: '1px solid #1f2937',
                          }}
                        >
                          <td
                            style={{
                              padding: '1rem',
                              fontSize: '13px',
                              color: '#e5e7eb',
                              fontFamily: 'monospace',
                            }}
                          >
                            {scan.target_url}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                backgroundColor: statusColor.bg,
                                color: statusColor.text,
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                              }}
                            >
                              {statusColor.label}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {scan.overall_risk ? (
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.75rem',
                                  backgroundColor: riskColor.bg,
                                  color: riskColor.text,
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                }}
                              >
                                {riskColor.label}
                              </span>
                            ) : (
                              <span style={{ color: '#6b7280', fontSize: '13px' }}>—</span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: '1rem',
                              fontSize: '13px',
                              color: '#e5e7eb',
                            }}
                          >
                            {scan.total_findings || 0}
                          </td>
                          <td
                            style={{
                              padding: '1rem',
                              fontSize: '13px',
                              color: '#9ca3af',
                            }}
                          >
                            {new Date(scan.started_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {scan.status === 'complete' ? (
                              <Link
                                href={`/report/${scan.id}`}
                                style={{
                                  color: '#3b82f6',
                                  textDecoration: 'none',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'color 0.2s ease',
                                }}
                                onMouseOver={(e) => (e.target.style.color = '#2563eb')}
                                onMouseOut={(e) => (e.target.style.color = '#3b82f6')}
                              >
                                View Report
                              </Link>
                            ) : (
                              <span style={{ color: '#6b7280', fontSize: '13px' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
