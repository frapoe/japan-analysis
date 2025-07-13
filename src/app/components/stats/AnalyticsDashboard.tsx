import React, { useMemo, useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { LineChart } from "./LineChart";
import { BarChartStats } from "./BarChartStats";

// メトリクスタイプ
type Metrics = {
  visitors: number;
  pageviews: number;
  duration: number; // 秒単位
};

// メトリクス比較の型
type MetricComparison = {
  value: number;
  change: number; // 前日比（%）
};

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
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 過去90日間のURLごとのデータを生成する関数
const generateUrlStats = (urlId: string, index: number) => {
  const today = new Date();
  const days = 90; // 90日分のデータ
  const result = [];

  // URLごとに異なるベース値とトレンドを設定
  const baseMultiplier = 0.8 + index * 0.3; // URLごとに異なるベース値
  const trendAmplitude = 0.3 + Math.random() * 0.4; // トレンドの強さ

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // 週末はアクセスが増える傾向を再現
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    // 日付に基づく周期的な変動（週単位）
    const weeklyCycle = Math.sin((i / 7) * Math.PI * 2) * 0.2 + 1; // 0.8〜1.2の範囲で変動

    // 長期トレンド（90日間で徐々に増加または減少）
    const trend = 1 + trendAmplitude * (i / days) - trendAmplitude / 2;

    // ベースの表示回数を計算
    let pageviews = Math.floor(
      (isWeekend ? 80 : 50) * // 週末はやや多め
        weeklyCycle * // 週単位の変動
        trend * // 長期トレンド
        baseMultiplier * // URLごとのベース値
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
    stats: generateUrlStats(url.id, index),
  }));
};

// 選択されたURLのデータをマージしてグラフ用のデータ形式に変換
const prepareChartData = (
  allStats: Array<{
    url?: UrlItem;
    stats: { date: string; pageviews: number }[];
  }>
): Array<{ date: string; [key: string]: string | number }> => {
  if (allStats.length === 0) return [];

  // 最初のURLのデータをベースに作成
  return allStats[0].stats.map((stat, index) => {
    const result: { [key: string]: string | number } = { date: stat.date };

    // 各URLのデータを追加
    allStats.forEach((urlStat, urlIndex) => {
      result[`url${urlIndex + 1}Pageviews`] =
        urlStat.stats[index]?.pageviews || 0;
    });

    return result as { date: string; [key: string]: string | number };
  });
};

type ListItem = {
  name: string;
  name_ja: string;
  count: number;
};

interface AnalyticsDashboardProps {
  list: ListItem[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  list,
}) => {
  // URL一覧の状態管理
  const [urls, setUrls] = useState<UrlItem[]>(INITIAL_URLS);
  // 選択可能なURLオプション
  const [urlOptions, setUrlOptions] = useState<UrlOption[]>([]);
  // プルダウンの表示状態
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 選択されたURLのIDの配列（デフォルトで空）
  const [selectedUrlIds, setSelectedUrlIds] = useState<string[]>([]);

  // 仮のメトリクスデータ
  // const MOCK_METRICS: Metrics = useMemo(
  //   () => ({
  //     visitors: 8567,
  //     pageviews: 24567,
  //     duration: 142,
  //   }),
  //   []
  // );

  // メトリクスデータの状態
  const [metrics, setMetrics] = useState<Metrics>({
    visitors: 0,
    pageviews: 0,
    duration: 0,
  });
  const [previousMetrics, setPreviousMetrics] = useState<Metrics>({
    visitors: 0,
    pageviews: 0,
    duration: 0,
  });

  // 前日比を計算する関数
  const calculateComparison = (
    current: number,
    previous: number
  ): MetricComparison => {
    if (previous === 0) return { value: current, change: 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: current, change: parseFloat(change.toFixed(1)) };
  };

  // コンポーネントマウント時にURLオプションをロードし、最初のURLを選択
  useEffect(() => {
    // ここで実際にはAPIからデータを取得する
    // 例: fetchUrlOptions().then(data => setUrlOptions(data));
    setUrlOptions(MOCK_URL_OPTIONS);

    // 最初のURLを選択
    if (MOCK_URL_OPTIONS.length > 0) {
      const firstUrl = MOCK_URL_OPTIONS[0];
      const initialUrl = {
        id: firstUrl.id,
        title: firstUrl.title,
        path: firstUrl.path,
      };
      setUrls([initialUrl]);
      setSelectedUrlIds([firstUrl.id]);
    }

    // メトリクスデータをロード（実際にはAPIから取得）
    const loadMetrics = () => {
      // 現在の期間のデータ
      const currentData = mockMetrics;
      // 前回期間のデータ（実際にはAPIから取得）
      const previousData = {
        visitors: Math.floor(mockMetrics.visitors * 0.8), // 仮の前回データ
        pageviews: Math.floor(mockMetrics.pageviews * 0.8), // 仮の前回データ
        duration: Math.floor(mockMetrics.duration * 0.9), // 仮の前回データ
      };

      setMetrics(currentData);
      setPreviousMetrics(previousData);
    };

    loadMetrics();
  }, [mockMetrics]);

  // 全URLの統計データを生成
  const allUrlStats = useMemo(() => generateAllUrlStats(urls), [urls]);

  // 選択されたURLの統計データを取得
  const selectedStats = useMemo(
    () =>
      selectedUrlIds.map((urlId) => {
        const url = urls.find((u) => u.id === urlId);
        const stats =
          allUrlStats.find((stat) => stat.urlId === urlId)?.stats || [];
        return { url, stats, urlId };
      }),
    [allUrlStats, selectedUrlIds, urls]
  );

  // グラフに表示するURLの最大数
  const MAX_URLS = 5;

  // グラフ用のデータを準備
  const chartData = useMemo(() => {
    // 型を合わせるために必要な変換
    const statsForChart = selectedStats.map(({ url, stats }) => ({
      urlId: url?.id || "",
      stats: stats.map((stat) => ({
        date: stat.date,
        pageviews: stat.pageviews,
      })),
    }));

    // 選択されたURLがなくても空のデータを返す
    if (statsForChart.length === 0) {
      return [];
    }

    return prepareChartData(statsForChart);
  }, [selectedStats]);

  // URLを追加する関数（追加時に自動的に選択状態にする）
  const addUrl = (urlOption: UrlOption) => {
    if (urls.length >= MAX_URLS) return; // 最大数を超えないようにする

    const newUrl: UrlItem = {
      id: urlOption.id,
      title: urlOption.title,
      path: urlOption.path,
    };

    setUrls((prev) => [...prev, newUrl]);
    setSelectedUrlIds((prev) => [...prev, newUrl.id]);
    setIsDropdownOpen(false);
  };

  // 選択可能なURLオプションをフィルタリング（既に追加済みのURLは除外）
  const availableUrlOptions = useMemo(() => {
    return urlOptions.filter(
      (option) => !urls.some((url) => url.id === option.id)
    );
  }, [urlOptions, urls]);

  // URLを削除する関数
  const removeUrl = (urlId: string) => {
    // URL一覧から削除
    setUrls((prev) => prev.filter((url) => url.id !== urlId));
    // 選択状態からも削除
    setSelectedUrlIds((prev) => prev.filter((id) => id !== urlId));
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

      const change =
        prevMonth > 0 ? ((currentMonth - prevMonth) / prevMonth) * 100 : 0;

      return {
        urlId: url?.id || "",
        title: url?.title || "",
        total,
        change: parseFloat(change.toFixed(1)),
      };
    });
  }, [selectedStats]);

  // メトリクス比較データを計算
  const visitorsComparison = calculateComparison(
    metrics.visitors,
    previousMetrics.visitors
  );
  const pageviewsComparison = calculateComparison(
    metrics.pageviews,
    previousMetrics.pageviews
  );
  const durationComparison = calculateComparison(
    metrics.duration,
    previousMetrics.duration
  );

  return (
    <div className="space-y-1">
      {/* メトリクスカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 ">
        <MetricCard
          title="訪問者数"
          value={visitorsComparison.value.toLocaleString()}
          change={visitorsComparison.change}
        />
        <MetricCard
          title="表示回数"
          value={pageviewsComparison.value.toLocaleString()}
          change={pageviewsComparison.change}
        />
        <MetricCard
          title="平均滞在時間"
          value={`${Math.floor(durationComparison.value / 60)}m ${
            durationComparison.value % 60
          }s`}
          change={durationComparison.change}
        />
      </div>
      {/* URLリストセクション */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-sm font-bold text-gray-700">URLを比較</h1>
          <div className="flex relative">
            <div className="relative mr-2">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={
                  urls.length >= MAX_URLS || availableUrlOptions.length === 0
                }
                className={`text-sm px-3 py-1 rounded-md text-xs flex items-center ${
                  urls.length >= MAX_URLS || availableUrlOptions.length === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                {urls.length >= MAX_URLS
                  ? "最大数に達しています"
                  : availableUrlOptions.length === 0
                  ? "追加できるURLがありません"
                  : "+ URLを追加"}
                <svg
                  className={`ml-1 w-4 h-4 transition-transform ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && availableUrlOptions.length > 0 && (
                <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1">
                  {availableUrlOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => addUrl(option)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                      {option.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ドロップダウン外をクリックで閉じる */}
            {isDropdownOpen && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {urls.map((url) => {
            const metric = urlMetrics.find((m) => m.urlId === url.id);

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
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        metric.change >= 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {metric.change >= 0 ? "↑" : "↓"} {Math.abs(metric.change)}
                      %
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* グラフセクション */}
      {selectedUrlIds.length > 0 && (
        <div className="mt-8">
          <LineChart
            data={chartData}
            urlCount={selectedUrlIds.length}
            selectedUrls={selectedStats.map((s) => s.url?.title || "")}
            className="mt-6"
          />
        </div>
      )}
    </div>
  );
};
