import React from 'react';

const severityColors = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-500 text-gray-900',
  LOW: 'bg-blue-500 text-white',
  INFO: 'bg-gray-500 text-white',
};

export const SeverityBadge = ({ severity }) => {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${severityColors[severity]}`}>
      {severity}
    </span>
  );
};
