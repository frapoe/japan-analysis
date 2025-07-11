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
  LegendPayload,
} from "recharts";

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

interface CustomTooltipPayload {
  name: string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: CustomTooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    const colors = [
      "#3b82f6", // blue-500
      "#ef4444", // red-500
      "#10b981", // green-500
      "#f59e0b", // yellow-500
      "#8b5cf6", // purple-500
      "#ec4899", // pink-500
      "#14b8a6", // teal-500
    ];

    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-sm text-sm">
        <p className="font-medium mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: { name: string; value: number }, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center">
              <div
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span>
                {entry.name}: {entry.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// 期間の型定義
type TimeRange = "7d" | "30d" | "90d";

// 色の配列を定義
const LINE_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#10b981", // green-500
  "#f59e0b", // yellow-500
  "#8b5cf6", // purple-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
];

// ダミーデータを生成する関数
const generateDummyData = (days: number) => {
  const today = new Date();
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dummyData: { [key: string]: string | number } = {
      date: date.toISOString().split("T")[0],
    };

    // ダミーデータはすべて0
    for (let idx = 0; idx < 5; idx++) {
      dummyData[`url${idx + 1}Pageviews`] = 0;
    }

    result.push(dummyData);
  }

  return result;
};

export const LineChart: React.FC<LineChartProps> = ({
  data,
  urlCount = 2,
  selectedUrls = [],
  hideLegend = false,
  className = "",
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  // 期間に応じたデータをフィルタリング
  const filteredData = useMemo(() => {
    const daysToShow = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    // データがある場合はそのデータを、ない場合はダミーデータを使用
    return data.length > 0
      ? data.slice(-daysToShow)
      : generateDummyData(daysToShow);
  }, [data, timeRange]);

  // データがあるかどうか
  const hasData =
    data.length > 0 &&
    data.some((d) =>
      Object.entries(d).some(([key, value]) => {
        if (key === "date") return false;
        return typeof value === "number" && value > 0;
      })
    );

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">アクセス数</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-3 py-1 text-sm rounded ${
              timeRange === "7d"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            7日間
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-3 py-1 text-sm rounded ${
              timeRange === "30d"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            30日間
          </button>
          <button
            onClick={() => setTimeRange("90d")}
            className={`px-3 py-1 text-sm rounded ${
              timeRange === "90d"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            90日間
          </button>
        </div>
      </div>
      <div className="h-96 relative">
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
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={hasData}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#4b5563", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: hasData ? "#e5e7eb" : "transparent" }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fill: "#4b5563", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={{ stroke: hasData ? "#e5e7eb" : "transparent" }}
              tickFormatter={(value) => {
                if (typeof value === 'number' && value >= 1000) return `${value / 1000}k`;
                return value === 0 ? "" : value;
              }}
              domain={[0, hasData ? "auto" : 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            {!hideLegend && hasData && (
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{
                  paddingTop: "20px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                formatter={(value) => (
                  <span className="text-sm text-gray-600">{value}</span>
                )}
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-4">
                    {payload?.map((entry: LegendPayload, index: number) => {
                      // データが0の凡例は表示しない
                      const dataKey = entry.dataKey as string;
                      const hasAnyData = data.some((d) => {
                        const value = d[dataKey];
                        return typeof value === "number" && value > 0;
                      });

                      if (!hasAnyData) return null;

                      return (
                        <div
                          key={`legend-${index}`}
                          className="flex items-center"
                        >
                          <div className="relative w-3 h-3 mr-1">
                            <div 
                              className="absolute inset-0 rounded-full" 
                              style={{ 
                                backgroundColor: '#fff',
                                border: `2px solid ${entry.color}`,
                                width: '12px',
                                height: '12px'
                              }}
                            />
                          </div>
                          <span className="text-sm">{entry.value}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            )}
            {Array.from({ length: urlCount }).map((_, index) => {
              const dataKey = `url${index + 1}Pageviews`;
              const color = LINE_COLORS[index % LINE_COLORS.length];
              const hasData = data.length > 0 && selectedUrls[index];

              return (
                <Line
                  key={`line-${index}`}
                  type="monotone"
                  dataKey={dataKey}
                  name={selectedUrls[index] || `URL ${index + 1}`}
                  stroke={color}
                  strokeWidth={hasData ? 2 : 0} // データがない場合は線を非表示
                  strokeOpacity={hasData ? 1 : 0} // データがない場合は透明に
                  dot={{
                    fill: '#fff',
                    stroke: color,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: '#fff',
                    stroke: color,
                    strokeWidth: 2,
                    r: 4,
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
