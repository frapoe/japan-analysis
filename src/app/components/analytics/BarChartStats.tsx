import React, { useState, useEffect } from "react";
import "../styles/stats.css";

// --- データ型定義 ---

// 都道府県のデータ型
export type Prefecture = {
  name: string;
  name_ja?: string;
  count: number;
};

// OS、デバイス、ブラウザ、リファラの共通データ型
interface StatItem {
  name: string;
  percentage: number;
  count?: number;
  url?: string;
}

// --- Propsの型定義 ---

interface BarChartStatsProps {
  prefectureList: Prefecture[];
  osStats?: StatItem[];
  deviceStats?: StatItem[];
  browserStats?: StatItem[];
  referrerStats?: StatItem[];
  colorConfig?: {
    hue: number;
    minSaturation: number;
    maxSaturation: number;
    lightness: number;
    zeroCountColor: string;
  };
}

// ダミーデータ
const dummyOsData: StatItem[] = [
  { name: "iOS", percentage: 45.2 },
  { name: "Android", percentage: 30.8 },
  { name: "Windows", percentage: 15.1 },
  { name: "macOS", percentage: 8.9 },
];

const dummyDeviceData: StatItem[] = [
  { name: "Mobile", percentage: 75.9 },
  { name: "Desktop", percentage: 20.1 },
  { name: "Tablet", percentage: 4.0 },
];

const dummyBrowserData: StatItem[] = [
  { name: "Chrome", percentage: 60.5 },
  { name: "Safari", percentage: 25.2 },
  { name: "Edge", percentage: 8.3 },
  { name: "Firefox", percentage: 6.0 },
];

const dummyReferrerData: StatItem[] = [
  { name: "google.com", url: "google.com", percentage: 50.1 },
  { name: "chatgpt.com", url: "chatgpt.com", percentage: 22.5 },
  { name: "bing.com", url: "bing.com", percentage: 15.9 },
  { name: "github.com", url: "github.com", percentage: 11.5 },
];

// --- コンポーネント本体 ---

const renderStatBar = (percentage: number) => (
  <div className="stat-bar-container">
    <div
      className="stat-bar"
      style={{
        width: `${percentage}%`,
        backgroundColor: "#0040FF",
      }}
    />
  </div>
);

const renderStatsList = (title: string, items: StatItem[]) => {
  // 合計アクセス数を計算（ダミーデータ用）
  const totalCount = 1000; // 仮の合計値

  return (
    <div className="stats-card">
      <h3 style={{ textTransform: "none", letterSpacing: "0.02em" }}>
        {title}
      </h3>
      <div className="stats-list">
        {items.map((item, index) => {
          // パーセンテージから人数を計算
          const count = Math.round((item.percentage / 100) * totalCount);

          return (
            <div key={`${title}-${index}`} className="stat-item">
              <div className="stat-name">{item.name}</div>
              {renderStatBar(item.percentage)}
              <div className="stat-count">{count.toLocaleString()}人</div>
              <div className="stat-percent">{item.percentage.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BarChartStats: React.FC<BarChartStatsProps> = ({
  prefectureList = [],
  osStats = dummyOsData,
  deviceStats = dummyDeviceData,
  browserStats = dummyBrowserData,
  referrerStats = dummyReferrerData,
  colorConfig = {
    hue: 210,
    minSaturation: 50,
    maxSaturation: 100,
    lightness: 50,
    zeroCountColor: "#f0f0f0",
  },
}) => {
  const [showAll, setShowAll] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 数値のフォーマットをクライアントサイドでのみ行う
  const formatNumber = (num: number) => {
    return isClient ? num.toLocaleString() : num.toString();
  };

  // --- 都道府県ランキングのロジック ---
  const maxCount = Math.max(...prefectureList.map((p) => p.count), 1);
  const sortedList = [...prefectureList].sort((a, b) => b.count - a.count);
  const totalVisitors = prefectureList.reduce(
    (sum, pref) => sum + pref.count,
    0
  );
  const displayedList = showAll ? sortedList : sortedList.slice(0, 10);

  const getBarColor = (percentage: number) => {
    if (percentage === 0) return colorConfig.zeroCountColor;
    return "#FFFFFF";
  };

  return (
    <div className="stats-section">
      {/* 都道府県ランキング */}
      {prefectureList.length > 0 && (
        <div className="stats-card">
          <div className="stats-list">
            {displayedList.map((pref) => {
              const percentage =
                totalVisitors > 0 ? (pref.count / totalVisitors) * 100 : 0;
              const barColor = getBarColor(percentage);

              return (
                <div key={pref.name} className="stat-item">
                  <div className="stat-name">
                    {pref.name_ja || pref.name.replace(/(都|道|府|県)$/, "")}
                  </div>
                  {renderStatBar(percentage)}
                  <div className="stat-count">{formatNumber(pref.count)}人</div>
                  <div className="stat-percent">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
          {sortedList.length > 10 && (
            <div className="mt-3 text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showAll ? "閉じる" : `さらに${sortedList.length - 10}件を表示`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* OS、デバイス、ブラウザ、リファラの統計 */}
      <div className="stats-grid">
        {renderStatsList("OS", osStats)}
        {renderStatsList("Devices", deviceStats)}
        {renderStatsList("Browsers", browserStats)}
        {renderStatsList("Referrers", referrerStats)}
      </div>
    </div>
  );
};
