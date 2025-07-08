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
    name: string;
    visits: number;
    pageviews: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-sm text-sm">
        <p className="font-medium">{label}</p>
        <p style={{ color: COLORS.primary }}>訪問者数: {payload[0].value}</p>
        <p style={{ color: COLORS.secondary }}>表示数: {payload[1].value}</p>
      </div>
    );
  }
  return null;
};

// 期間の型定義
type TimeRange = '7d' | '30d' | '90d';

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  
  // 現在時刻を取得
  const now = new Date();
  
  // 期間に応じたデータをフィルタリング
  const filteredData = useMemo(() => {
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToShow + 1);
    
    return data.filter(item => {
      const itemDate = new Date(item.name);
      return itemDate >= startDate && itemDate <= now;
    });
  }, [data, timeRange, now]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
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
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={filteredData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name"
              tick={{ fill: "#4b5563" }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fill: "#4b5563" }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="visits"
              name="訪問者数"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={{
                fill: '#fff',
                stroke: COLORS.primary,
                strokeWidth: 2,
                r: 4,
                strokeDasharray: '',
              }}
              activeDot={{
                r: 6,
                stroke: COLORS.primary,
                strokeWidth: 2,
                fill: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="pageviews"
              name="表示数"
              stroke={COLORS.secondary}
              strokeWidth={2}
              dot={{
                fill: '#fff',
                stroke: COLORS.secondary,
                strokeWidth: 2,
                r: 4,
                strokeDasharray: '',
              }}
              activeDot={{
                r: 6,
                stroke: COLORS.secondary,
                strokeWidth: 2,
                fill: '#fff',
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
