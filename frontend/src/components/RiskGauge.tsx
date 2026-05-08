import React from 'react';

interface RiskGaugeProps {
  riskScore: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ riskScore }) => {
  const percentage = Math.min(riskScore, 100);
  const rotation = (percentage / 100) * 180 - 90;

  const getRiskColor = (score: number) => {
    if (score >= 80) return '#dc2626';
    if (score >= 60) return '#ea580c';
    if (score >= 40) return '#eab308';
    if (score >= 20) return '#2563eb';
    return '#6b7280';
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <svg viewBox="0 0 200 120" width="200" height="120" className="mb-4">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#374151"
          strokeWidth="8"
        />
        {/* Gauge arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getRiskColor(percentage)}
          strokeWidth="8"
          strokeDasharray={`${(percentage / 100) * 251.3} 251.3`}
        />
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2={100 + 70 * Math.cos((rotation * Math.PI) / 180)}
          y2={100 + 70 * Math.sin((rotation * Math.PI) / 180)}
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Center circle */}
        <circle cx="100" cy="100" r="6" fill="#fff" />
        {/* Labels */}
        <text x="30" y="115" fill="#9ca3af" fontSize="12">
          0
        </text>
        <text x="155" y="115" fill="#9ca3af" fontSize="12">
          100
        </text>
      </svg>
      <p className="text-2xl font-bold text-white">{percentage.toFixed(0)}</p>
    </div>
  );
};
