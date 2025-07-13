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
  count: number;
  url?: string;
}

// --- Propsの型定義 ---

interface BarChartStatsProps {
  prefectureList: Prefecture[];
  osStats: StatItem[];
  deviceStats: StatItem[];
  browserStats: StatItem[];
  referrerStats: StatItem[];
  colorConfig?: {
    hue: number;
    minSaturation: number;
    maxSaturation: number;
    lightness: number;
    zeroCountColor: string;
  };
}

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
  if (!items || items.length === 0) {
    return null;
  }
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="stats-card">
      <h3 style={{ textTransform: "none", letterSpacing: "0.02em" }}>
        {title}
      </h3>
      <div className="stats-list">
        {items.map((item, index) => {
          const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;

          return (
            <div key={`${title}-${index}`} className="stat-item">
              <div className="stat-name">{item.name}</div>
              {renderStatBar(percentage)}
              <div className="stat-count">{item.count.toLocaleString()}人</div>
              <div className="stat-percent">{percentage.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const BarChartStats: React.FC<BarChartStatsProps> = ({
  prefectureList = [],
  osStats,
  deviceStats,
  browserStats,
  referrerStats,
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
