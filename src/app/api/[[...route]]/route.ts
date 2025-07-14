import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath("/api");

type StatItem = {
  name: string;
  count: number;
  url?: string;
};

// --- MOCK DATA ---

const mockUrl = [
  { name: "url1", url: "url1.com", count: 100 },
  { name: "url2", url: "url2.com", count: 200 },
  { name: "url3", url: "url3.com", count: 300 },
  { name: "url4", url: "url4.com", count: 400 },
  { name: "url5", url: "url5.com", count: 500 },
  { name: "url6", url: "url6.com", count: 600 },
  { name: "url7", url: "url7.com", count: 700 },
  { name: "url8", url: "url8.com", count: 800 },
];

const mockMetrics: StatItem[] = [
  { name: "visitors", count: 8567 },
  { name: "pageviews", count: 24567 },
  { name: "duration", count: 142 },
];

const mockOsData: StatItem[] = [
  { name: "iOS", count: 100 },
  { name: "Android", count: 80 },
  { name: "Windows", count: 50 },
  { name: "macOS", count: 30 },
];

const mockDeviceData: StatItem[] = [
  { name: "Mobile", count: 180 },
  { name: "Desktop", count: 80 },
  { name: "Tablet", count: 20 },
];

const mockBrowserData: StatItem[] = [
  { name: "Chrome", count: 150 },
  { name: "Safari", count: 70 },
  { name: "Edge", count: 30 },
  { name: "Firefox", count: 20 },
];

const mockReferrerData: StatItem[] = [
  { name: "google.com", url: "google.com", count: 120 },
  { name: "chatgpt.com", url: "chatgpt.com", count: 60 },
  { name: "bing.com", url: "bing.com", count: 40 },
  { name: "github.com", url: "github.com", count: 30 },
];

const mockPrefectureData: StatItem[] = [
  { name: "北海道", count: 15 },
  { name: "青森県", count: 0 },
  { name: "岩手県", count: 0 },
  { name: "宮城県", count: 8 },
  { name: "秋田県", count: 0 },
  { name: "山形県", count: 5 },
  { name: "福島県", count: 0 },
  { name: "茨城県", count: 12 },
  { name: "栃木県", count: 10 },
  { name: "群馬県", count: 7 },
  { name: "埼玉県", count: 25 },
  { name: "千葉県", count: 22 },
  { name: "東京都", count: 100 },
  { name: "神奈川県", count: 35 },
  { name: "新潟県", count: 8 },
  { name: "富山県", count: 6 },
  { name: "石川県", count: 8 },
  { name: "福井県", count: 0 },
  { name: "山梨県", count: 4 },
  { name: "長野県", count: 8 },
  { name: "岐阜県", count: 6 },
  { name: "静岡県", count: 15 },
  { name: "愛知県", count: 45 },
  { name: "三重県", count: 10 },
  { name: "滋賀県", count: 8 },
  { name: "京都府", count: 28 },
  { name: "大阪府", count: 65 },
  { name: "兵庫県", count: 32 },
  { name: "奈良県", count: 12 },
  { name: "和歌山県", count: 6 },
  { name: "鳥取県", count: 0 },
  { name: "島根県", count: 0 },
  { name: "岡山県", count: 15 },
  { name: "広島県", count: 25 },
  { name: "山口県", count: 8 },
  { name: "徳島県", count: 5 },
  { name: "香川県", count: 6 },
  { name: "愛媛県", count: 10 },
  { name: "高知県", count: 0 },
  { name: "福岡県", count: 35 },
  { name: "佐賀県", count: 4 },
  { name: "長崎県", count: 8 },
  { name: "熊本県", count: 12 },
  { name: "大分県", count: 6 },
  { name: "宮崎県", count: 4 },
  { name: "鹿児島県", count: 10 },
  { name: "沖縄県", count: 20 },
];

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createDateArray = (days: number) => {
  const today = new Date();
  return Array.from({ length: days })
    .map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return formatDate(date);
    })
    .reverse();
};

const dates = createDateArray(90);

// --- ENDPOINTS ---

app.get("/analytics", (c) => {
  return c.json({
    prefecture: mockPrefectureData,
    os: mockOsData,
    device: mockDeviceData,
    browser: mockBrowserData,
    referrer: mockReferrerData,
  });
});

const handler = handle(app);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
  handler as OPTIONS,
};
