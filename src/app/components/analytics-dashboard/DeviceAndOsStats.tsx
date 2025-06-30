import React from "react";
import "../styles/stats.css";

interface StatItem {
  name: string;
  percentage: number;
}

interface DeviceAndOsStatsProps {
  osStats: StatItem[];
  deviceStats: StatItem[];
}

export const DeviceAndOsStats: React.FC<DeviceAndOsStatsProps> = ({
  osStats,
  deviceStats,
}) => {
  const renderStatItem = (item: StatItem & { count?: number }) => {
    const count = item.count || Math.round(Math.random() * 1000);

    return (
      <div key={item.name} className="stat-item">
        <div className="stat-name">{item.name}</div>
        <div className="stat-bar-container">
          <div
            className="stat-bar"
            style={{
              width: `${item.percentage}%`,
              backgroundColor: "#0040FF",
            }}
          />
        </div>
        <div className="stat-count">{count.toLocaleString()}</div>
        <div className="stat-percent">{item.percentage.toFixed(1)}%</div>
      </div>
    );
  };

  return (
    <div className="stats-container device-os-container">
      <div className="device-os-section">
        <h3>OS</h3>
        <div className="stats-list">
          {osStats.map((os, index) =>
            renderStatItem({
              ...os,
              count: Math.round(os.percentage * 10), // 仮の人数を生成
            })
          )}
        </div>
      </div>
      <div className="device-os-section">
        <h3>Devices</h3>
        <div className="stats-list">
          {deviceStats.map((device, index) =>
            renderStatItem({
              ...device,
              count: Math.round(device.percentage * 10), // 仮の人数を生成
            })
          )}
        </div>
      </div>
    </div>
  );
};
