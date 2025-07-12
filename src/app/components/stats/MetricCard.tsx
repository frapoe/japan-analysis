import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  tooltip?: string;
  className?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  tooltip,
  className = '',
  icon,
}) => {
  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon && <div className="mr-2">{icon}</div>}
          <h3 className="text-sm font-medium text-gray-600">
            {title}
          </h3>
        </div>
        {tooltip && (
          <span className="text-gray-400 hover:text-gray-600 cursor-help" title={tooltip}>
            ⓘ
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="text-xl font-semibold text-gray-800">
          {value}
        </p>
        {change !== undefined && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
};
