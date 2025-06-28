import React from 'react';
import { MetricCard } from './MetricCard';
import { BarChart } from './BarChart';

// 仮のデータを生成する関数
const generateHourlyData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23時
  return hours.map(hour => {
    const visits = Math.floor(Math.random() * 100) + 10; // 10-110のランダムな値
    const additionalViews = Math.floor(Math.random() * 100) + 5; // 5-105の追加表示数
    return {
      name: `${hour}:00`,
      visits,
      pageviews: visits + additionalViews, // 必ず訪問者数以上になる
    };
  });
};

export const AnalyticsDashboard: React.FC = () => {
  // 仮のデータ
  const metrics = {
    pageviews: 2483,
    pageviewsChange: 12.5,
    visitors: 1241,
    visitorsChange: 8.2,
    avgDuration: '2m 45s',
    avgDurationChange: -3.2,
  };

  const hourlyData = generateHourlyData().map(item => ({
    ...item,
    additionalViews: Math.max(0, item.pageviews - item.visits) // 追加表示数（表示数 - 訪問者数）
  }));

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MetricCard
          title="表示数"
          value={metrics.pageviews.toLocaleString()}
          change={metrics.pageviewsChange}
          tooltip="ページが表示された合計回数"
        />
        <MetricCard
          title="訪問者数"
          value={metrics.visitors.toLocaleString()}
          change={metrics.visitorsChange}
          tooltip="ユニークな訪問者数（IPアドレスに基づく）"
        />
        <MetricCard
          title="平均滞在時間"
          value={metrics.avgDuration}
          change={metrics.avgDurationChange}
          tooltip="セッションあたりの平均滞在時間"
        />
      </div>

      <BarChart data={hourlyData} />
    </div>
  );
};
