'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { scanAPI } from '@/lib/api';
import { ScanProgress } from '@/components/ScanProgress';

const tests = [
  { name: 'BOLA', label: 'Broken Object Level Authorization' },
  { name: 'Broken Authentication', label: 'Broken Authentication' },
  { name: 'Rate Limiting', label: 'Missing Rate Limiting' },
  { name: 'Mass Assignment', label: 'Mass Assignment' },
  { name: 'Excessive Exposure', label: 'Excessive Data Exposure' },
  { name: 'SSRF', label: 'Server-Side Request Forgery' },
];

export default function ScanPage() {
  const router = useRouter();
  const [targetUrl, setTargetUrl] = useState('http://vulnerable-api:8001');
  const [authToken, setAuthToken] = useState('');
  const [selectedTests, setSelectedTests] = useState(
    tests.map(t => t.name.toLowerCase().replace(' ', '_'))
  );
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);

  const handleTestChange = (testName) => {
    setSelectedTests(prev =>
      prev.includes(testName) ? prev.filter(t => t !== testName) : [...prev, testName]
    );
  };

  const handleStartScan = async () => {
    setScanning(true);
    try {
      const response = await scanAPI.createScan(targetUrl, authToken || undefined, selectedTests);
      setScanId(response.data.scan_id);
      
      // Poll for scan status
      const pollInterval = setInterval(async () => {
        const statusResponse = await scanAPI.getScan(response.data.scan_id);
        setScanStatus(statusResponse.data);
        
        if (statusResponse.data.status === 'complete' || statusResponse.data.status === 'failed') {
          clearInterval(pollInterval);
          setScanning(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error starting scan:', error);
      setScanning(false);
    }
  };

  const progressTests = tests.map(t => ({
    name: t.label,
    status: scanStatus ? 'done' : scanning ? 'running' : 'pending',
    findings: scanStatus?.findings?.filter(f => 
      f.test_name.toLowerCase() === t.name.toLowerCase()
    ).length || 0,
  }));

  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Start New Security Scan</h1>

        {!scanId ? (
          <div className="grid grid-cols-2 gap-8">
            {/* Scan Form */}
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <label className="block text-white font-semibold mb-2">Target URL</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={scanning}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 mb-4"
                  placeholder="http://localhost:8001"
                />

                <label className="block text-white font-semibold mb-2">Auth Token (Optional)</label>
                <input
                  type="text"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  disabled={scanning}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 mb-6"
                  placeholder="Bearer token if needed"
                />

                <label className="block text-white font-semibold mb-3">Tests to Run</label>
                <div className="space-y-2">
                  {tests.map(test => (
                    <label key={test.name} className="flex items-center text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.name.toLowerCase().replace(' ', '_'))}
                        onChange={() => handleTestChange(test.name.toLowerCase().replace(' ', '_'))}
                        disabled={scanning}
                        className="mr-3"
                      />
                      {test.label}
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleStartScan}
                  disabled={scanning || !targetUrl}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg"
                >
                  {scanning ? 'Scanning...' : 'Start Scan'}
                </button>
              </div>
            </div>

            {/* Progress */}
            {scanning && (
              <div>
                <ScanProgress tests={progressTests} />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Scan {scanStatus?.status}</h2>
            <p className="text-gray-400 mb-6">Scan ID: {scanId}</p>
            {scanStatus?.status === 'complete' && (
              <button
                onClick={() => router.push(`/report/${scanId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
              >
                View Full Report
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
