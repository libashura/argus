import React from 'react';
import { SeverityBadge } from './SeverityBadge';

interface Test {
  name: string;
  status: 'pending' | 'running' | 'done' | 'vulnerable';
  findings?: number;
}

interface ScanProgressProps {
  tests: Test[];
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ tests }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'running':
        return '🔄';
      case 'vulnerable':
        return '⚠️';
      case 'done':
        return '✓';
      default:
        return '?';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4">Scan Progress</h3>
      <div className="space-y-3">
        {tests.map((test) => (
          <div key={test.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getStatusIcon(test.status)}</span>
              <span className="text-white">{test.name}</span>
            </div>
            <div className="text-right">
              {test.findings && test.findings > 0 && (
                <span className="text-red-400 font-semibold">{test.findings} finding(s)</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
