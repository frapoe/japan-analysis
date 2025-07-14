"use client";

import React, { useState, useEffect } from 'react';
import JapanMap from "./components/japan-map";
import { AnalyticsDashboard } from "./components/stats/AnalyticsDashboard";
import { BarChartStats } from "./components/stats/BarChartStats";

// データ型定義
interface StatItem {
  name: string;
  count: number;
  url?: string;
}

async function fetchData(endpoint: string): Promise<StatItem[]> {
  const res = await fetch(`/api/${endpoint}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return res.json();
}

export default function Page() {
  const [prefectureData, setPrefectureData] = useState<StatItem[]>([]);
  const [osData, setOsData] = useState<StatItem[]>([]);
  const [deviceData, setDeviceData] = useState<StatItem[]>([]);
  const [browserData, setBrowserData] = useState<StatItem[]>([]);
  const [referrerData, setReferrerData] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [p, o, d, b, r] = await Promise.all([
          fetchData('prefecture'),
          fetchData('os'),
          fetchData('device'),
          fetchData('browser'),
          fetchData('referrer'),
        ]);
        setPrefectureData(p);
        setOsData(o);
        setDeviceData(d);
        setBrowserData(b);
        setReferrerData(r);
      } catch (error) {
        console.error("Data fetching error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const prefectureList = prefectureData.map(p => ({ ...p, name_ja: p.name }));

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <AnalyticsDashboard list={prefectureList} />

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <JapanMap list={prefectureList} />
      </div>

      <div className="mt-8">
        <BarChartStats 
          prefectureList={prefectureList}
          osStats={osData}
          deviceStats={deviceData}
          browserStats={browserData}
          referrerStats={referrerData}
          colorConfig={{
            hue: 210,
            minSaturation: 50,
            maxSaturation: 100,
            lightness: 50,
            zeroCountColor: "#f0f0f0"
          }}
        />
      </div>
    </div>
  );
}