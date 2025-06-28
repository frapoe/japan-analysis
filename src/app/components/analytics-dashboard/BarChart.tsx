import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

interface BarChartProps {
  data: Array<{
    name: string;
    visits: number;
    pageviews: number;
    additionalViews: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-sm text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-[#4f46e5]">訪問者数: {payload[0].value}</p>
        <p className="text-[#10b981]">追加表示数: {payload[1].value}</p>
        <p className="font-medium mt-1">合計表示数: {payload[0].value + payload[1].value}</p>
      </div>
    );
  }
  return null;
};

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        時間帯別アクティビティ
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            barGap={0}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#4b5563' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fill: '#4b5563' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="visits" 
              name="訪問者数"
              stackId="a"
              fill="#4f46e5"
              radius={[4, 0, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#4f46e5" />
              ))}
            </Bar>
            <Bar 
              dataKey="additionalViews" 
              name="追加表示数"
              stackId="a"
              fill="#10b981"
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#10b981" />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
