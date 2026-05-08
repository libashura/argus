'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { scanAPI } from '@/lib/api';
import { SeverityBadge } from '@/components/SeverityBadge';
import { FindingCard } from '@/components/FindingCard';
import { RiskGauge } from '@/components/RiskGauge';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

interface Finding {
  id: string;
  test_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  status: string;
  endpoint: string;
  evidence: string;
  recommendation: string;
  owasp_category: string;
  cvss_score: number;
}

interface Scan {
  id: string;
  target_url: string;
  status: string;
  overall_risk: string;
  started_at: string;
  completed_at: string;
  total_findings: number;
  findings: Finding[];
}

export default function ReportPage() {
  const params = useParams();
  const scanId = params.id as string;
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
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

    fetchScan();
  }, [scanId]);

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
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 p-8 text-white">Loading...</div>;
  }

  if (!scan) {
    return <div className="min-h-screen bg-gray-900 p-8 text-white">Scan not found</div>;
  }

  const severityCounts: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    INFO: 0,
  };

  scan.findings.forEach(f => {
    severityCounts[f.severity]++;
  });

  const chartData = Object.entries(severityCounts)
    .filter(([, count]) => count > 0)
    .map(([severity, count]) => ({
      name: severity,
      value: count,
    }));

  const severityColors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#ea580c',
    MEDIUM: '#eab308',
    LOW: '#2563eb',
    INFO: '#6b7280',
  };

  const riskScore = scan.overall_risk === 'CRITICAL' ? 90 : 
                    scan.overall_risk === 'HIGH' ? 70 :
                    scan.overall_risk === 'MEDIUM' ? 50 :
                    scan.overall_risk === 'LOW' ? 30 : 10;

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Risk Banner */}
        <div className={`rounded-lg p-8 mb-8 text-center ${
          scan.overall_risk === 'CRITICAL' ? 'bg-red-600' :
          scan.overall_risk === 'HIGH' ? 'bg-orange-500' :
          scan.overall_risk === 'MEDIUM' ? 'bg-yellow-500' :
          scan.overall_risk === 'LOW' ? 'bg-blue-500' :
          'bg-gray-600'
        }`}>
          <h1 className="text-4xl font-bold text-white mb-2">Overall Risk: {scan.overall_risk}</h1>
          <p className="text-white text-lg">Target: {scan.target_url}</p>
        </div>

        {/* Summary Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Risk Gauge */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Risk Score</h3>
            <RiskGauge riskScore={riskScore} />
          </div>

          {/* Severity Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 col-span-2">
            <h3 className="text-white font-semibold mb-4">Findings by Severity</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={severityColors[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No findings</p>
            )}
          </div>
        </div>

        {/* Findings */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Findings ({scan.total_findings})</h2>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>

          {scan.findings.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
              No findings - API appears to be secure!
            </div>
          ) : (
            ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(severity => {
              const findingsByType = scan.findings.filter(f => f.severity === severity);
              if (findingsByType.length === 0) return null;

              return (
                <div key={severity} className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <SeverityBadge severity={severity as any} />
                    {findingsByType.length} {severity} Findings
                  </h3>
                  <div className="space-y-4">
                    {findingsByType.map(finding => (
                      <FindingCard key={finding.id} finding={finding} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
