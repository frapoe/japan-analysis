import React, { useState, useMemo, useEffect } from "react";
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
  className?: string;
}

interface UrlData {
  name: string;
  url: string;
  count: number;
}

interface ChartData {
  date: string;
  [key: string]: string | number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const colors = [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
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

type TimeRange = "7d" | "30d" | "90d";

const LINE_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export const LineChart: React.FC<LineChartProps> = ({ className = "" }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlData, setUrlData] = useState<UrlData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/url");
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const fetchedUrlData: UrlData[] = await res.json();
        setUrlData(fetchedUrlData);

        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const chartData = Array.from({ length: days }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (days - 1 - i));
          const formattedDate = date.toISOString().split("T")[0];
          const dataPoint: ChartData = { date: formattedDate };
          fetchedUrlData.forEach((url, index) => {
            dataPoint[`url${index + 1}Pageviews`] = Math.floor(
              Math.random() * url.count
            );
          });
          return dataPoint;
        });
        setData(chartData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const filteredData = useMemo(() => {
    return data;
  }, [data]);

  const hasData = useMemo(() => {
    return (
      data.length > 0 &&
      data.some((d) =>
        Object.entries(d).some(([key, value]) => {
          if (key === "date") return false;
          return typeof value === "number" && value > 0;
        })
      )
    );
  }, [data]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={`rounded-lg ${className}`}>
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
                if (typeof value === "number" && value >= 1000)
                  return `${value / 1000}k`;
                return value === 0 ? "" : value;
              }}
              domain={[0, hasData ? "auto" : 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            {hasData && (
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
                                backgroundColor: "#fff",
                                border: `2px solid ${entry.color}`,
                                width: "12px",
                                height: "12px",
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
            {urlData.map((url, index) => {
              const dataKey = `url${index + 1}Pageviews`;
              const color = LINE_COLORS[index % LINE_COLORS.length];

              return (
                <Line
                  key={`line-${index}`}
                  type="monotone"
                  dataKey={dataKey}
                  name={url.name}
                  stroke={color}
                  strokeWidth={2}
                  strokeOpacity={1}
                  dot={{
                    fill: "#fff",
                    stroke: color,
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    fill: "#fff",
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