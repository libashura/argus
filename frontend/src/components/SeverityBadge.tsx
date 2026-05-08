import React from 'react';

interface SeverityBadgeProps {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
}

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-500 text-gray-900',
  LOW: 'bg-blue-500 text-white',
  INFO: 'bg-gray-500 text-white',
};

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${severityColors[severity]}`}>
      {severity}
    </span>
  );
};
