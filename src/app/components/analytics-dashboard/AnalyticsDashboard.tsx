import React, { useMemo, useState } from "react";
import { MetricCard } from "./MetricCard";
import { LineChart } from "./LineChart";

// グラフの色定義
const LINE_COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
];

// URLの型定義
interface UrlItem {
  id: string;
  path: string;
  title: string;
}

// 初期URL一覧（デフォルトでは空）
const INITIAL_URLS: UrlItem[] = [];

// 日付フォーマットを整える関数
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 新しいURLを生成する関数
const generateNewUrl = (): UrlItem => {
  const id = `url${Date.now()}`;
  return {
    id,
    path: `/new-path/${id}`,
    title: `新しいURL ${id.slice(-4)}`
  };
};

// 過去90日間のURLごとのデータを生成する関数
const generateUrlStats = (urlId: string, index: number) => {
  const today = new Date();
  const days = 90; // 90日分のデータ
  const result = [];
  
  // URLごとに異なるベース値とトレンドを設定
  const baseMultiplier = 0.8 + (index * 0.3); // URLごとに異なるベース値
  const trendAmplitude = 0.3 + (Math.random() * 0.4); // トレンドの強さ
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 週末はアクセスが増える傾向を再現
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // 日付に基づく周期的な変動（週単位）
    const weeklyCycle = Math.sin((i / 7) * Math.PI * 2) * 0.2 + 1; // 0.8〜1.2の範囲で変動
    
    // 長期トレンド（90日間で徐々に増加または減少）
    const trend = 1 + (trendAmplitude * (i / days)) - (trendAmplitude / 2);
    
    // ベースの表示回数を計算
    let pageviews = Math.floor(
      (isWeekend ? 80 : 50) * // 週末はやや多め
      weeklyCycle *           // 週単位の変動
      trend *                 // 長期トレンド
      baseMultiplier *        // URLごとのベース値
      (0.9 + Math.random() * 0.2) // ランダムな変動
    );
    
    // マイナスにならないように調整
    pageviews = Math.max(10, pageviews);
    
    result.push({
      date: formatDate(date),
      pageviews,
    });
  }
  
  return result;
};

// 全URLの統計データを生成
const generateAllUrlStats = (urls: UrlItem[]) => {
  return urls.map((url, index) => ({
    urlId: url.id,
    stats: generateUrlStats(url.id, index)
  }));
};

// 選択されたURLのデータをマージしてグラフ用のデータ形式に変換
const prepareChartData = (allStats: Array<{url?: UrlItem, stats: any[]}>) => {
  if (allStats.length === 0) return [];
  
  // 最初のURLのデータをベースに作成
  return allStats[0].stats.map((stat, index) => {
    const result: any = { date: stat.date };
    
    // 各URLのデータを追加
    allStats.forEach((urlStat, urlIndex) => {
      result[`url${urlIndex + 1}Pageviews`] = urlStat.stats[index]?.pageviews || 0;
    });
    
    return result;
  });
};

export const AnalyticsDashboard: React.FC = () => {
  // URL一覧の状態管理
  const [urls, setUrls] = useState<UrlItem[]>(INITIAL_URLS);
  
  // 選択されたURLのIDの配列（デフォルトで空）
  const [selectedUrlIds, setSelectedUrlIds] = useState<string[]>([]);
  
  // 全URLの統計データを生成
  const allUrlStats = useMemo(() => generateAllUrlStats(urls), [urls]);
  
  // 選択されたURLの統計データを取得
  const selectedStats = useMemo(() => 
    selectedUrlIds.map(urlId => {
      const url = urls.find(u => u.id === urlId);
      const stats = allUrlStats.find(stat => stat.urlId === urlId)?.stats || [];
      return { url, stats, urlId };
    }),
    [allUrlStats, selectedUrlIds, urls]
  );
  
  // グラフ用のデータを準備
  const chartData = useMemo(() => {
    // 型を合わせるために必要な変換
    const statsForChart = selectedStats.map(({ url, stats }) => ({
      urlId: url?.id || '',
      stats: stats.map(stat => ({
        date: stat.date,
        pageviews: stat.pageviews
      }))
    }));
    return prepareChartData(statsForChart);
  }, [selectedStats]);
  
  // URLを追加する関数（追加時に自動的に選択状態にする）
  const addUrl = () => {
    const newUrl = generateNewUrl();
    setUrls(prev => [...prev, newUrl]);
    setSelectedUrlIds(prev => [...prev, newUrl.id]);
  };
  
  // URLを削除する関数
  const removeUrl = (urlId: string) => {
    // URL一覧から削除
    setUrls(prev => prev.filter(url => url.id !== urlId));
    // 選択状態からも削除
    setSelectedUrlIds(prev => prev.filter(id => id !== urlId));
  };
  
  // 各URLのメトリクスを計算
  const urlMetrics = useMemo(() => {
    return selectedStats.map(({ url, stats }) => {
      const total = stats.reduce((sum, item) => sum + item.pageviews, 0);
      
      // 前月と今月のデータを比較
      const prevMonth = stats
        .filter((_, index) => index < 30)
        .reduce((sum, item) => sum + item.pageviews, 0);
      
      const currentMonth = stats
        .filter((_, index) => index >= 60)
        .reduce((sum, item) => sum + item.pageviews, 0);
      
      const change = prevMonth > 0 
        ? ((currentMonth - prevMonth) / prevMonth) * 100 
        : 0;
      
      return {
        urlId: url?.id || '',
        title: url?.title || '',
        total,
        change: parseFloat(change.toFixed(1)),
      };
    });
  }, [selectedStats]);

  return (
    <div className="space-y-4">
      {/* URLリストセクション */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-medium text-gray-700">比較するURL</h2>
          <div className="flex space-x-2">
            <button
              onClick={addUrl}
              className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md text-xs"
            >
              + URLを追加
            </button>
          </div>
        </div>
        
        {urls.length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            比較するURLがありません。追加してください。
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {urls.map((url) => {
              const isSelected = selectedUrlIds.includes(url.id);
              const metric = urlMetrics.find(m => m.urlId === url.id);
              
              return (
                <div 
                  key={url.id}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm border bg-blue-50 border-blue-200 text-blue-700"
                >
                  <div className="flex items-center space-x-2">
                    <span className="truncate max-w-[150px]" title={url.title}>
                      {url.title}
                    </span>
                    {metric && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        metric.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {metric.change >= 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUrl(url.id);
                      }}
                      className="text-blue-400 hover:text-red-500 p-0.5"
                      title="削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      


      {/* グラフセクション */}
      {selectedUrlIds.length > 0 && (
        <div className="space-y-4">
          <div className="h-80">
            <LineChart 
              data={chartData} 
              urlCount={selectedUrlIds.length} 
              selectedUrls={selectedStats.map(s => s.url?.title || '')}
              className="mt-6"
            />
          </div>
          
          {/* 凡例 */}
          <div className="flex flex-wrap gap-4 justify-center">
            {selectedStats.map(({ url, urlId }, index) => (
              <div key={urlId || index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor: LINE_COLORS[index % LINE_COLORS.length]
                  }}
                />
                <span className="text-sm text-gray-700">{url?.title || `URL ${index + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
