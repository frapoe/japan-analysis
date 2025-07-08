"use client";

import JapanMap from "./components/japan-map";
import { AnalyticsDashboard } from "./components/analytics-dashboard/AnalyticsDashboard";
import { DeviceAndOsStats } from "./components/analytics-dashboard/DeviceAndOsStats";

export default function Page() {
  const list = [
    { name: "hokkaido", name_ja: "北海道", count: 15 },
    { name: "aomori", name_ja: "青森県", count: 0 },
    { name: "iwate", name_ja: "岩手県", count: 0 },
    { name: "miyagi", name_ja: "宮城県", count: 8 },
    { name: "akita", name_ja: "秋田県", count: 0 },
    { name: "yamagata", name_ja: "山形県", count: 5 },
    { name: "fukushima", name_ja: "福島県", count: 0 },
    { name: "ibaraki", name_ja: "茨城県", count: 12 },
    { name: "tochigi", name_ja: "栃木県", count: 10 },
    { name: "gunma", name_ja: "群馬県", count: 7 },
    { name: "saitama", name_ja: "埼玉県", count: 25 },
    { name: "chiba", name_ja: "千葉県", count: 22 },
    { name: "tokyo", name_ja: "東京都", count: 100 },
    { name: "kanagawa", name_ja: "神奈川県", count: 35 },
    { name: "niigata", name_ja: "新潟県", count: 8 },
    { name: "toyama", name_ja: "富山県", count: 6 },
    { name: "ishikawa", name_ja: "石川県", count: 8 },
    { name: "fukui", name_ja: "福井県", count: 0 },
    { name: "yamanashi", name_ja: "山梨県", count: 4 },
    { name: "nagano", name_ja: "長野県", count: 8 },
    { name: "gifu", name_ja: "岐阜県", count: 6 },
    { name: "shizuoka", name_ja: "静岡県", count: 15 },
    { name: "aichi", name_ja: "愛知県", count: 45 },
    { name: "mie", name_ja: "三重県", count: 10 },
    { name: "shiga", name_ja: "滋賀県", count: 8 },
    { name: "kyoto", name_ja: "京都府", count: 28 },
    { name: "osaka", name_ja: "大阪府", count: 65 },
    { name: "hyogo", name_ja: "兵庫県", count: 32 },
    { name: "nara", name_ja: "奈良県", count: 12 },
    { name: "wakayama", name_ja: "和歌山県", count: 6 },
    { name: "tottori", name_ja: "鳥取県", count: 0 },
    { name: "shimane", name_ja: "島根県", count: 0 },
    { name: "okayama", name_ja: "岡山県", count: 15 },
    { name: "hiroshima", name_ja: "広島県", count: 25 },
    { name: "yamaguchi", name_ja: "山口県", count: 8 },
    { name: "tokushima", name_ja: "徳島県", count: 5 },
    { name: "kagawa", name_ja: "香川県", count: 6 },
    { name: "ehime", name_ja: "愛媛県", count: 10 },
    { name: "kochi", name_ja: "高知県", count: 0 },
    { name: "fukuoka", name_ja: "福岡県", count: 35 },
    { name: "saga", name_ja: "佐賀県", count: 4 },
    { name: "nagasaki", name_ja: "長崎県", count: 8 },
    { name: "kumamoto", name_ja: "熊本県", count: 12 },
    { name: "oita", name_ja: "大分県", count: 6 },
    { name: "miyazaki", name_ja: "宮崎県", count: 4 },
    { name: "kagoshima", name_ja: "鹿児島県", count: 10 },
    { name: "okinawa", name_ja: "沖縄県", count: 20 },
  ];
  // 仮のOS統計データ
  const osStats = [
    { name: "Windows", percentage: 65.2 },
    { name: "MacOS", percentage: 22.8 },
    { name: "iOS", percentage: 8.5 },
    { name: "Android", percentage: 3.2 },
    { name: "Others", percentage: 0.3 },
  ];

  // 仮のデバイス統計データ
  const deviceStats = [
    { name: "PC", percentage: 62.4 },
    { name: "Mobile", percentage: 32.1 },
    { name: "Tablet", percentage: 5.5 },
    { name: "Others", percentage: 0.3 },
  ];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <AnalyticsDashboard />

      <div className="mt-6">
        <JapanMap list={list} />
      </div>

      <div>
        <h2 className="text-lg font-medium mb-6"></h2>
        <DeviceAndOsStats osStats={osStats} deviceStats={deviceStats} />
      </div>
    </div>
  );
}
