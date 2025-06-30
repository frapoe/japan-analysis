import React, { useState } from "react";
import "../styles/stats.css";
export type Prefecture = {
  name: string;
  name_ja?: string;
  count: number;
};

interface PrefectureStatsProps {
  list: Prefecture[];
  colorConfig: {
    hue: number;
    minSaturation: number;
    maxSaturation: number;
    lightness: number;
    zeroCountColor: string;
  };
}

const PrefectureStats: React.FC<PrefectureStatsProps> = ({
  list,
  colorConfig,
}) => {
  const maxCount = Math.max(...list.map((p) => p.count), 1);
  const [showAll, setShowAll] = useState(false);
  const sortedList = [...list].sort((a, b) => b.count - a.count);
  const totalVisitors = list.reduce((sum, pref) => sum + pref.count, 0);
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

  return (
    <div className="stats-container">
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
              <div className="stat-count">{pref.count}人</div>
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
            {showAll ? '閉じる' : `さらに${sortedList.length - 10}件を表示`}
          </button>
        </div>
      )}


    </div>
  );
};

export default PrefectureStats;
