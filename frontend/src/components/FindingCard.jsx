import React from 'react';
import { SeverityBadge } from './SeverityBadge';

export const FindingCard = ({ finding }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{finding.test_name}</h3>
          <SeverityBadge severity={finding.severity} />
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">CVSS Score</p>
          <p className="text-2xl font-bold text-white">{finding.cvss_score.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-sm">Endpoint</p>
          <code className="bg-gray-900 text-green-400 p-2 rounded text-sm block">{finding.endpoint}</code>
        </div>
        <div>
          <p className="text-gray-400 text-sm">OWASP Category</p>
          <p className="text-white text-sm">{finding.owasp_category}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-400 text-sm mb-2">Evidence</p>
        <pre className="bg-gray-900 text-gray-300 p-3 rounded text-xs overflow-x-auto">
          {finding.evidence}
        </pre>
      </div>

      <div>
        <p className="text-gray-400 text-sm mb-2">Recommendation</p>
        <p className="text-gray-300 text-sm">{finding.recommendation}</p>
      </div>
    </div>
  );
};
