import React, { useMemo } from "react";
import { MetricCard } from "./MetricCard";
import { LineChart } from "./LineChart";

// 日付フォーマットを整える関数
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 過去90日間のデータを生成する関数
const generateDailyData = () => {
  const today = new Date();
  const days = 90; // 90日分のデータ
  const result = [];
  
  // 月ごとのトレンドを追加するためのベース値
  const monthlyTrend = Array.from({ length: 3 }, () => 0.8 + Math.random() * 0.4); // 0.8〜1.2の範囲のトレンド
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 週末はアクセスが増える傾向を再現
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // 月のどの週か（0-3）
    const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
    
    // 月のトレンドを適用（0-2）
    const monthIndex = Math.floor(i / 30);
    const monthlyFactor = monthlyTrend[Math.min(2, monthIndex)];
    
    // ベースの訪問者数を計算
    let baseVisits = isWeekend 
      ? Math.floor(Math.random() * 50) + 50 // 週末: 50-100
      : Math.floor(Math.random() * 40) + 30; // 平日: 30-70
    
    // 月のトレンドを適用
    baseVisits = Math.round(baseVisits * monthlyFactor);
    
    // 週の変動を追加（月の後半はやや増加）
    if (weekOfMonth >= 2) {
      baseVisits = Math.round(baseVisits * (1.1 + (weekOfMonth - 2) * 0.05));
    }
    
    // 表示数は訪問者数の1.2〜2.0倍
    const pageviewsMultiplier = 1.2 + Math.random() * 0.8;
    const pageviews = Math.round(baseVisits * pageviewsMultiplier);
    
    result.push({
      name: formatDate(date),
      visits: baseVisits,
      pageviews: pageviews,
    });
  }
  
  return result;
};

export const AnalyticsDashboard: React.FC = () => {
  // 90日分のデータを生成
  const dailyData = useMemo(() => generateDailyData(), []);
  
  // メトリクスを計算
  const metrics = useMemo(() => {
    const totalVisits = dailyData.reduce((sum, item) => sum + item.visits, 0);
    const totalPageviews = dailyData.reduce((sum, item) => sum + item.pageviews, 0);
    // 前月と今月のデータを比較
    const prevMonthData = dailyData.filter((_, index) => index < 30);
    const currentMonthData = dailyData.filter((_, index) => index >= 60);
    
    const prevPeriodVisits = prevMonthData
      .reduce((sum, item) => sum + item.visits, 0);
    const currentPeriodVisits = currentMonthData
      .reduce((sum, item) => sum + item.visits, 0);
    
    const visitsChange = prevPeriodVisits > 0 
      ? ((currentPeriodVisits - prevPeriodVisits) / prevPeriodVisits) * 100 
      : 0;
    
    // 平均滞在時間を計算（秒）
    const avgDurationSeconds = Math.floor(Math.random() * 120) + 30; // 30-150秒
    const avgDuration = `${Math.floor(avgDurationSeconds / 60)}m ${avgDurationSeconds % 60}s`;
    
    return {
      pageviews: totalPageviews,
      pageviewsChange: 12.5, // 簡略化のため固定値
      visitors: totalVisits,
      visitorsChange: parseFloat(visitsChange.toFixed(1)),
      avgDuration,
      avgDurationChange: -3.2, // 簡略化のため固定値
    };
  }, [dailyData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <LineChart data={dailyData} />
    </div>
  );
};
