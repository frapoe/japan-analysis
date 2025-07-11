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
  osStats: StatItem[];
  deviceStats: StatItem[];
  browserStats: StatItem[];
  referrerStats: StatItem[];
  colorConfig: {
    hue: number;
    minSaturation: number;
    maxSaturation: number;
    lightness: number;
    zeroCountColor: string;
  };
}

// --- 仮データ ---

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
  { name: "twitter.com", url: "twitter.com", percentage: 22.5 },
  { name: "youtube.com", url: "youtube.com", percentage: 15.9 },
  { name: "instagram.com", url: "instagram.com", percentage: 11.5 },
];

// --- コンポーネント本体 ---

export const BarChartStats: React.FC<BarChartStatsProps> = ({
  prefectureList,
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

  const getBarColor = (count: number) => {
    if (count === 0) return colorConfig.zeroCountColor;
    const percentage = (count / maxCount) * 100;
    const saturation =
      colorConfig.minSaturation +
      (percentage / 100) *
        (colorConfig.maxSaturation - colorConfig.minSaturation);
    return `hsl(${colorConfig.hue}, ${saturation}%, ${colorConfig.lightness}%)`;
  };

  // --- 共通の統計項目レンダリング関数 ---
  const renderStatItem = (item: StatItem & { count?: number }) => {
    const count = item.count || Math.round(Math.random() * 1000);
    const name = item.url || item.name;

    return (
      <div key={name} className="stat-item">
        <div className="stat-name">{name}</div>
        <div className="stat-bar-container">
          <div
            className="stat-bar"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: "#0040FF",
            }}
          />
        </div>
        <div className="stat-count">{formatNumber(count)}</div>
        <div className="stat-percent">{item.percentage.toFixed(1)}%</div>
      </div>
    );
  };

  return (
    <div className="stats-container space-y-6">
      {/* --- 都道府県ランキング --- */}
      <div className="device-os-section">
        {/* <h3 classame="text-sm font-medium text-gray-700 mb-2">Top Prefectures</h3> */}
        <div className="stats-list">
          {displayedList.map((pref) => {
            const percentage =
              totalVisitors > 0 ? (pref.count / totalVisitors) * 100 : 0;
            const barWidth = (pref.count / maxCount) * 100;

            return (
              <div key={pref.name} className="stat-item">
                <div className="stat-name">
                  {pref.name_ja || pref.name.replace(/(都|道|府|県)$/, "")}
                </div>
                <div className="stat-bar-container">
                  <div
                    className="stat-bar"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: getBarColor(pref.count),
                    }}
                  />
                </div>
                <div className="stat-count">{formatNumber(pref.count)}人</div>
                <div className="stat-percent">
                  {totalVisitors > 0 ? percentage.toFixed(1) : "0.0"}%
                </div>
              </div>
            );
          })}
        </div>
        {sortedList.length > 10 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showAll ? "閉じる" : `さらに${sortedList.length - 10}件を表示`}
            </button>
          </div>
        )}
      </div>

      {/* --- OS, Devices, Browsers, Referrers --- */}
      <div className="device-os-section">
        <h3 className="text-sm font-medium text-gray-700 mb-2">OS</h3>
        <div className="stats-list">
          {osStats.map((os) => renderStatItem(os))}
        </div>
      </div>

      <div className="device-os-section">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Devices</h3>
        <div className="stats-list">
          {deviceStats.map((device) => renderStatItem(device))}
        </div>
      </div>

      <div className="device-os-section">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Browsers</h3>
        <div className="stats-list">
          {browserStats.map((browser) => renderStatItem(browser))}
        </div>
      </div>

      <div className="device-os-section">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Referrers</h3>
        <div className="stats-list">
          {referrerStats.map((referrer) => renderStatItem(referrer))}
        </div>
      </div>
    </div>
  );
};
