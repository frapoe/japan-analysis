import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  tooltip?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  tooltip,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">
          {title}
        </h3>
        {tooltip && (
          <span className="text-gray-400 hover:text-gray-600 cursor-help" title={tooltip}>
            ⓘ
          </span>
        )}
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-800">
          {value}
        </p>
        {change !== undefined && (
          <span
            className={`ml-2 text-sm font-medium ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
};
