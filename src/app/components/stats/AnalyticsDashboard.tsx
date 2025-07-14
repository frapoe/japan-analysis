import React, { useMemo, useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { LineChart } from "./LineChart";

// --- TYPE DEFINITIONS ---

type Metrics = {
  visitors: number;
  pageviews: number;
  duration: number; // in seconds
};

type MetricComparison = {
  value: number;
  change: number; // percentage change
};

interface UrlItem {
  id: string;
  path: string;
  title: string;
}

interface UrlOption {
  id: string;
  title: string;
  path: string;
}

interface UrlStats {
  urlId: string;
  stats: { date: string; pageviews: number }[];
}

type ListItem = {
  name: string;
  name_ja: string;
  count: number;
};

interface AnalyticsDashboardProps {
  list: ListItem[];
}

// --- HELPER FUNCTIONS ---

const prepareChartData = (
  selectedStats: Array<{ url?: UrlItem; stats: { date: string; pageviews: number }[] }>
): Array<{ date: string; [key: string]: string | number }> => {
  if (selectedStats.length === 0) return [];

  const allDates = selectedStats[0]?.stats.map(s => s.date) || [];

  return allDates.map((date, index) => {
    const result: { [key: string]: string | number; date: string } = { date };
    selectedStats.forEach((urlStat, urlIndex) => {
      result[`url${urlIndex + 1}Pageviews`] = urlStat.stats[index]?.pageviews || 0;
    });
    return result;
  });
};

// --- COMPONENT ---

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ list }) => {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [urlOptions, setUrlOptions] = useState<UrlOption[]>([]);
  const [allUrlStats, setAllUrlStats] = useState<UrlStats[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedUrlIds, setSelectedUrlIds] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ visitors: 0, pageviews: 0, duration: 0 });
  const [previousMetrics, setPreviousMetrics] = useState<Metrics>({ visitors: 0, pageviews: 0, duration: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [urlsRes, metricsRes, urlStatsRes] = await Promise.all([
          fetch('/api/urls'),
          fetch('/api/metrics'),
          fetch('/api/url/stats'),
        ]);

        const urlsData: UrlOption[] = await urlsRes.json();
        const metricsData: { current: Metrics, previous: Metrics } = await metricsRes.json();
        const urlStatsData: UrlStats[] = await urlStatsRes.json();

        setUrlOptions(urlsData);
        setAllUrlStats(urlStatsData);
        setMetrics(metricsData.current);
        setPreviousMetrics(metricsData.previous);

        if (urlsData.length > 0) {
          const firstUrl = urlsData[0];
          setUrls([firstUrl]);
          setSelectedUrlIds([firstUrl.id]);
        }
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      }
    };

    fetchData();
  }, []);

  const calculateComparison = (current: number, previous: number): MetricComparison => {
    if (previous === 0) return { value: current, change: 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: current, change: parseFloat(change.toFixed(1)) };
  };

  const selectedStats = useMemo(
    () =>
      selectedUrlIds.map((urlId) => {
        const url = urls.find((u) => u.id === urlId);
        const stats = allUrlStats.find((stat) => stat.urlId === urlId)?.stats || [];
        return { url, stats, urlId };
      }),
    [allUrlStats, selectedUrlIds, urls]
  );

  const MAX_URLS = 5;

  const chartData = useMemo(() => prepareChartData(selectedStats), [selectedStats]);

  const addUrl = (urlOption: UrlOption) => {
    if (urls.length >= MAX_URLS) return;
    const newUrl: UrlItem = { id: urlOption.id, title: urlOption.title, path: urlOption.path };
    setUrls((prev) => [...prev, newUrl]);
    setSelectedUrlIds((prev) => [...prev, newUrl.id]);
    setIsDropdownOpen(false);
  };

  const removeUrl = (urlId: string) => {
    setUrls((prev) => prev.filter((url) => url.id !== urlId));
    setSelectedUrlIds((prev) => prev.filter((id) => id !== urlId));
  };

  const availableUrlOptions = useMemo(() => {
    return urlOptions.filter((option) => !urls.some((url) => url.id === option.id));
  }, [urlOptions, urls]);

  const urlMetrics = useMemo(() => {
    return selectedStats.map(({ url, stats }) => {
      const total = stats.reduce((sum, item) => sum + item.pageviews, 0);
      const prevMonth = stats.slice(0, 30).reduce((sum, item) => sum + item.pageviews, 0);
      const currentMonth = stats.slice(-30).reduce((sum, item) => sum + item.pageviews, 0);
      const change = prevMonth > 0 ? ((currentMonth - prevMonth) / prevMonth) * 100 : 0;
      return {
        urlId: url?.id || "",
        title: url?.title || "",
        total,
        change: parseFloat(change.toFixed(1)),
      };
    });
  }, [selectedStats]);

  const visitorsComparison = calculateComparison(metrics.visitors, previousMetrics.visitors);
  const pageviewsComparison = calculateComparison(metrics.pageviews, previousMetrics.pageviews);
  const durationComparison = calculateComparison(metrics.duration, previousMetrics.duration);

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-1 md:grid-cols-3 ">
        <MetricCard title="訪問者数" value={visitorsComparison.value.toLocaleString()} change={visitorsComparison.change} />
        <MetricCard title="表示回数" value={pageviewsComparison.value.toLocaleString()} change={pageviewsComparison.change} />
        <MetricCard title="平均滞在時間" value={`${Math.floor(durationComparison.value / 60)}m ${durationComparison.value % 60}s`} change={durationComparison.change} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-sm font-bold text-gray-700">URLを比較</h1>
          <div className="flex relative">
            <div className="relative mr-2">
              <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} disabled={urls.length >= MAX_URLS || availableUrlOptions.length === 0} className={`text-sm px-3 py-1 rounded-md text-xs flex items-center ${urls.length >= MAX_URLS || availableUrlOptions.length === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                {urls.length >= MAX_URLS ? "最大数に達しています" : availableUrlOptions.length === 0 ? "追加できるURLがありません" : "+ URLを追加"}
                <svg className={`ml-1 w-4 h-4 transition-transform ${isDropdownOpen ? "transform rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isDropdownOpen && availableUrlOptions.length > 0 && (
                <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1">
                  {availableUrlOptions.map((option) => (
                    <button key={option.id} type="button" onClick={() => addUrl(option)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                      {option.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isDropdownOpen && <div className="fixed inset-0 z-0" onClick={() => setIsDropdownOpen(false)} />}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {urls.map((url) => {
            const metric = urlMetrics.find((m) => m.urlId === url.id);
            return (
              <div key={url.id} className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm border bg-blue-50 border-blue-200 text-blue-700">
                <div className="flex items-center space-x-2">
                  <span className="truncate max-w-[150px]" title={url.title}>{url.title}</span>
                  {metric && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${metric.change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {metric.change >= 0 ? "↑" : "↓"} {Math.abs(metric.change)}%
                    </span>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); removeUrl(url.id); }} className="text-blue-400 hover:text-red-500 p-0.5" title="削除">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedUrlIds.length > 0 && (
        <div className="mt-8">
          <LineChart className="mt-6" />
        </div>
      )}
    </div>
  );
};