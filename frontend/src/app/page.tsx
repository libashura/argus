'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { scanAPI } from '@/lib/api';
import { SeverityBadge } from '@/components/SeverityBadge';

interface Scan {
  id: string;
  target_url: string;
  status: string;
  overall_risk: string | null;
  total_findings: number;
  started_at: string;
}

export default function Dashboard() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await scanAPI.listScans();
        setScans(response.data);
      } catch (error) {
        console.error('Error fetching scans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
    const interval = setInterval(fetchScans, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">ProbeBlade Dashboard</h1>
            <p className="text-gray-400">Automated API Security Testing</p>
          </div>
          <Link
            href="/scan"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            + New Scan
          </Link>
        </div>

        {/* Scans Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading scans...</div>
          ) : scans.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No scans yet.</p>
              <Link href="/scan" className="text-blue-400 hover:underline">
                Start your first scan
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Target URL</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Overall Risk</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Findings</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr key={scan.id} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="px-6 py-4 text-sm text-gray-300">{scan.target_url}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        scan.status === 'complete' ? 'bg-green-600 text-white' :
                        scan.status === 'running' ? 'bg-blue-600 text-white' :
                        scan.status === 'failed' ? 'bg-red-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {scan.overall_risk ? (
                        <SeverityBadge severity={scan.overall_risk as any} />
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{scan.total_findings}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{formatDate(scan.started_at)}</td>
                    <td className="px-6 py-4 text-sm">
                      {scan.status === 'complete' ? (
                        <Link
                          href={`/report/${scan.id}`}
                          className="text-blue-400 hover:text-blue-300 font-semibold"
                        >
                          View Report
                        </Link>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
