'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { scanAPI } from '@/lib/api';

export default function ReportPage() {
  const params = useParams();
  const scanId = params.id;
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchScan();
  }, [scanId]);

  const fetchScan = async () => {
    try {
      const response = await scanAPI.getScan(scanId);
      setScan(response.data);
    } catch (error) {
      console.error('Error fetching scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await scanAPI.downloadReport(scanId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `probeblade-report-${scanId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="page-container">
          <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
            <div
              style={{
                fontSize: '32px',
                animation: 'spin 1s linear infinite',
                display: 'inline-block',
                marginBottom: '1rem',
              }}
            >
              ⟳
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading report...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!scan) {
    return (
      <LayoutWrapper>
        <div className="page-container">
          <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#f3f4f6', marginBottom: '1rem' }}>
              Report Not Found
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '1.5rem' }}>
              The scan report could not be found.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  // Calculate severity counts
  const severityCounts = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0,
  };

  if (scan.findings && Array.isArray(scan.findings)) {
    scan.findings.forEach(f => {
      if (severityCounts.hasOwnProperty(f.severity)) {
        severityCounts[f.severity]++;
      }
    });
  }

  // Risk color mapping
  const getRiskColor = (risk) => {
    const colors = {
      CRITICAL: { bg: '#ef4444', light: '#ef444450', text: '#fca5a5' },
      HIGH: { bg: '#f97316', light: '#f9731650', text: '#fdba74' },
      MEDIUM: { bg: '#eab308', light: '#eab30850', text: '#fde047' },
      LOW: { bg: '#3b82f6', light: '#3b82f650', text: '#93c5fd' },
      INFO: { bg: '#6b7280', light: '#6b728050', text: '#d1d5db' },
    };
    return colors[risk] || colors.INFO;
  };

  const riskColor = getRiskColor(scan.overall_risk);

  return (
    <LayoutWrapper>
      <div className="page-container">
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {/* Risk Banner */}
          <div
            style={{
              backgroundColor: riskColor.bg,
              padding: '2rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.5rem' }}>
              OVERALL RISK LEVEL
            </p>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: '700',
                marginBottom: '0.5rem',
              }}
            >
              {scan.overall_risk}
            </h1>
            <p style={{ fontSize: '13px', opacity: 0.9 }}>
              {scan.target_url}
            </p>
          </div>

          {/* Severity Breakdown */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(severity => {
              const color = getRiskColor(severity);
              const count = severityCounts[severity];
              return (
                <div key={severity} className="card" style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: color.bg,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {count}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>
                    {severity}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Download Button */}
          <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: downloading ? '#4b5563' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: downloading ? 'not-allowed' : 'pointer',
                opacity: downloading ? 0.6 : 1,
              }}
              onMouseOver={(e) => {
                if (!downloading) {
                  e.target.style.backgroundColor = '#059669';
                }
              }}
              onMouseOut={(e) => {
                if (!downloading) {
                  e.target.style.backgroundColor = '#10b981';
                }
              }}
            >
              {downloading ? 'Downloading...' : 'Download PDF Report'}
            </button>
          </div>

          {/* Findings */}
          <div>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#f3f4f6',
                marginBottom: '1rem',
              }}
            >
              Detailed Findings
            </h2>

            {!scan.findings || scan.findings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✓</div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#10b981',
                    marginBottom: '0.5rem',
                  }}
                >
                  No Vulnerabilities Found
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                  Your API appears to be secure based on the conducted tests.
                </p>
              </div>
            ) : (
              ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(severity => {
                const findingsByType = scan.findings.filter(f => f.severity === severity);
                if (findingsByType.length === 0) return null;

                return (
                  <div key={severity} style={{ marginBottom: '2rem' }}>
                    <h3
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: getRiskColor(severity).bg,
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {severity} - {findingsByType.length} finding{findingsByType.length > 1 ? 's' : ''}
                    </h3>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {findingsByType.map((finding, idx) => (
                        <div key={`${severity}-${idx}`} className="card">
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '1rem',
                            }}
                          >
                            <div>
                              <h4
                                style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#f3f4f6',
                                  marginBottom: '0.25rem',
                                }}
                              >
                                {finding.test_name || 'Unknown Test'}
                              </h4>
                              <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                                {finding.endpoint || 'N/A'}
                              </p>
                            </div>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                backgroundColor: getRiskColor(severity).light,
                                color: getRiskColor(severity).text,
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                              }}
                            >
                              {severity}
                            </span>
                          </div>

                          {finding.description && (
                            <div style={{ marginBottom: '1rem' }}>
                              <p style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: '1.5' }}>
                                {finding.description}
                              </p>
                            </div>
                          )}

                          {finding.evidence && (
                            <div style={{ marginBottom: '1rem' }}>
                              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '0.5rem' }}>
                                Evidence:
                              </p>
                              <pre
                                style={{
                                  backgroundColor: '#0a0f1e',
                                  border: '1px solid #1f2937',
                                  borderRadius: '4px',
                                  padding: '0.75rem',
                                  fontSize: '11px',
                                  color: '#10b981',
                                  fontFamily: 'monospace',
                                  overflow: 'auto',
                                  maxHeight: '150px',
                                  margin: 0,
                                }}
                              >
                                {finding.evidence}
                              </pre>
                            </div>
                          )}

                          {finding.recommendation && (
                            <div>
                              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '0.5rem' }}>
                                Recommendation:
                              </p>
                              <p style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: '1.5' }}>
                                {finding.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid #1f2937',
              textAlign: 'center',
            }}
          >
            <Link
              href="/"
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
