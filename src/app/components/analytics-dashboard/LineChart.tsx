import React, { useState, useMemo } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// 色の定数を定義
const COLORS = {
  primary: "#0000FF",
  secondary: "#FF0000",
};

interface LineChartProps {
  data: Array<{
    [key: string]: string | number;
    date: string;
  }>;
  urlCount: number;
  selectedUrls: string[];
  hideLegend?: boolean;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const colors = [
      '#3b82f6', // blue-500
      '#ef4444', // red-500
      '#10b981', // green-500
      '#f59e0b', // yellow-500
      '#8b5cf6', // purple-500
      '#ec4899', // pink-500
      '#14b8a6', // teal-500
    ];

    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-sm text-sm">
        <p className="font-medium mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center">
              <div 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span>{entry.name}: {entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// 期間の型定義
type TimeRange = '7d' | '30d' | '90d';

// 色の配列を定義
const LINE_COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // green-500
  '#f59e0b', // yellow-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
];

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  urlCount = 2, 
  selectedUrls = [], 
  hideLegend = false,
  className = ''
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  // 期間に応じたデータをフィルタリング
  const filteredData = useMemo(() => {
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return data.slice(-daysToShow);
  }, [data, timeRange]);

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">アクセス数</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-sm rounded ${
              timeRange === '7d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            7日間
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 text-sm rounded ${
              timeRange === '30d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            30日間
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 text-sm rounded ${
              timeRange === '90d'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            90日間
          </button>
        </div>
      </div>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={filteredData}
            margin={{
              top: 10,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#4b5563", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${(date.getMonth() + 1)}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fill: "#4b5563", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={(value) => {
                if (value >= 1000) return `${value / 1000}k`;
                return value;
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {!hideLegend && (
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value, entry: any, index: number) => (
                  <span className="text-sm text-gray-600">{value}</span>
                )}
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {payload?.map((entry: any, index: number) => (
                      <div key={`legend-${index}`} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              />
            )}
            {Array.from({ length: urlCount }).map((_, index) => {
              const dataKey = `url${index + 1}Pageviews`;
              const color = LINE_COLORS[index % LINE_COLORS.length];
              
              return (
                <Line
                  key={`line-${index}`}
                  type="monotone"
                  dataKey={dataKey}
                  name={selectedUrls[index] || `URL ${index + 1}`}
                  stroke={color}
                  strokeWidth={2}
                  dot={{
                    fill: '#fff',
                    stroke: color,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: color,
                    strokeWidth: 2,
                    fill: '#fff',
                  }}
                />
              );
            })}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
