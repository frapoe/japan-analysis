import React, { useState } from "react";
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
    <div className="prefecture-stats">
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
      <style jsx>{`
        .prefecture-stats {
          margin-top: 1rem;
          color: #000000;
          background-color: #ffffff;
          width: 100%;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          padding: 0.5rem 1rem;
        }
        .stats-list {
          display: grid;
          gap: 0.05rem;
        }
        .stat-item {
          display: grid;
          grid-template-columns: 100px 1fr 80px 60px;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.9rem;
          padding: 0.05rem 0;
        }
        .stat-name {
          min-width: 80px;
        }
        .stat-bar-container {
          height: 10px;
          background-color: #f3f4f6;
          border-radius: 1px;
          overflow: hidden;
          flex-grow: 1;
        }
        .stat-bar {
          height: 100%;
          transition: width 0.3s ease;
        }
        .stat-count {
          text-align: right;
          min-width: 60px;
        }
        .stat-percent {
          text-align: right;
          color: #666; /* パーセントの色を少し濃いグレーに */
          min-width: 50px;
          font-weight: 500;
        }
        @media (max-width: 640px) {
          .stat-item {
            grid-template-columns: 80px 1fr 60px 50px;
            gap: 0.5rem;
            font-size: 0.8rem;
          }
          .stat-name {
            min-width: 60px;
          }
        }
      `}</style>
    </div>
  );
};

export default PrefectureStats;
