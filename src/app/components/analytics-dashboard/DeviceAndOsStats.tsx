import React from 'react';

export type StatItem = {
  name: string;
  percentage: number;
  count?: number; // カウントを追加
};

interface DeviceAndOsStatsProps {
  osStats: StatItem[];
  deviceStats: StatItem[];
}

export const DeviceAndOsStats: React.FC<DeviceAndOsStatsProps> = ({
  osStats,
  deviceStats,
}) => {
  const getBarColor = (percentage: number) => {
    // PrefectureStatsのカラースキームに合わせる
    const hue = 220; // 青系の色
    const minSaturation = 30;
    const maxSaturation = 100;
    const lightness = 50; // 明るさを調整
    
    const saturation = minSaturation + (percentage / 100) * (maxSaturation - minSaturation);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const renderStatBar = (item: StatItem, index: number) => {
    const barColor = getBarColor(item.percentage);
    
    return (
      <div key={item.name} className="stat-item">
        <div className="stat-name">{item.name}</div>
        <div className="stat-bar-container">
          <div
            className="stat-bar"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
        <div className="stat-percent">{item.percentage.toFixed(1)}%</div>
      </div>
    );
  };

  return (
    <div className="prefecture-stats">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">OS別アクセス</h3>
          <div className="stats-list">
            {osStats.map((os, index) => renderStatBar(os, index))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-4">デバイス別アクセス</h3>
          <div className="stats-list">
            {deviceStats.map((device, index) => renderStatBar(device, index + osStats.length))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .prefecture-stats {
          margin-top: 1rem;
          color: #000000;
          background-color: #ffffff;
          width: 100%;
          max-width: 100%;
          padding: 1rem;
        }
        .stats-list {
          display: grid;
          gap: 0.5rem;
        }
        .stat-item {
          display: grid;
          grid-template-columns: 100px 1fr 70px;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          padding: 0.25rem 0;
        }
        .stat-name {
          min-width: 80px;
        }
        .stat-bar-container {
          height: 10px;
          background-color: #f3f4f6;
          border-radius: 1px;
          overflow: hidden;
        }
        .stat-bar {
          height: 100%;
        }
        .stat-percent {
          text-align: right;
          min-width: 50px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};
