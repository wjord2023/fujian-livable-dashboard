export const greenLivableSummary = {
  latestYear: 2024,
  cityCount: 9,
  avgIndex: 56.97,
  avgUrbanization: 69.3,
  avgGdpPerCapita: 129218,
  avgEco: 84.14,
  improvement: 24.95,
};

export const greenLivableTrend = [
  { year: 2015, index: 32.02, urbanization: 60.51, eco: 63.12, life: 16.36 },
  { year: 2016, index: 34.63, urbanization: 61.49, eco: 66.49, life: 20.05 },
  { year: 2017, index: 38.11, urbanization: 62.76, eco: 70.52, life: 24.48 },
  { year: 2018, index: 41.3, urbanization: 63.73, eco: 73.52, life: 29 },
  { year: 2019, index: 45.62, urbanization: 64.42, eco: 77.78, life: 36.17 },
  { year: 2020, index: 47.35, urbanization: 66.54, eco: 78.34, life: 39.74 },
  { year: 2021, index: 50.14, urbanization: 67.64, eco: 81.44, life: 46.36 },
  { year: 2022, index: 52.96, urbanization: 68.16, eco: 83.23, life: 51.56 },
  { year: 2023, index: 55.29, urbanization: 69.12, eco: 83.3, life: 55.07 },
  { year: 2024, index: 56.97, urbanization: 69.3, eco: 84.14, life: 58.85 },
];

export const cityGreenLivable = [
  {
    city: "宁德市",
    index: 68.13,
    eco: 87.92,
    health: 53.48,
    education: 70.48,
    life: 60.64,
    urbanization: 64.02,
    gdpPerCapita: 131054,
    population: 316,
    density: 235.4,
  },
  {
    city: "泉州市",
    index: 63.26,
    eco: 90.15,
    health: 39.03,
    education: 32.8,
    life: 91.06,
    urbanization: 71.03,
    gdpPerCapita: 146796,
    population: 891,
    density: 549.5,
  },
  {
    city: "三明市",
    index: 58.39,
    eco: 59.72,
    health: 70.68,
    education: 55.73,
    life: 47.43,
    urbanization: 65.93,
    gdpPerCapita: 127418,
    population: 242,
    density: 100.6,
  },
  {
    city: "福州市",
    index: 57.91,
    eco: 95.43,
    health: 43.57,
    education: 29.47,
    life: 63.19,
    urbanization: 74.21,
    gdpPerCapita: 165793,
    population: 852,
    density: 486,
  },
  {
    city: "莆田市",
    index: 55.96,
    eco: 87.36,
    health: 63.27,
    education: 19.82,
    life: 53.37,
    urbanization: 65.27,
    gdpPerCapita: 103241,
    population: 318,
    density: 345.5,
  },
  {
    city: "南平市",
    index: 54.54,
    eco: 97.89,
    health: 52.21,
    education: 29.37,
    life: 38.71,
    urbanization: 62.42,
    gdpPerCapita: 83647,
    population: 262,
    density: 99.1,
  },
  {
    city: "漳州市",
    index: 54.31,
    eco: 58.99,
    health: 60.21,
    education: 30.34,
    life: 67.67,
    urbanization: 64.12,
    gdpPerCapita: 119092,
    population: 505,
    density: 333.5,
  },
  {
    city: "厦门市",
    index: 50.6,
    eco: 95.65,
    health: 34.77,
    education: 8.07,
    life: 63.91,
    urbanization: 90.95,
    gdpPerCapita: 163651,
    population: 536,
    density: 512.2,
  },
  {
    city: "龙岩市",
    index: 49.64,
    eco: 84.11,
    health: 44.57,
    education: 26.18,
    life: 43.71,
    urbanization: 65.73,
    gdpPerCapita: 122274,
    population: 271,
    density: 141.8,
  },
];

export const dimensionAverages = [
  {
    name: "生态环境",
    value: Number(
      (
        cityGreenLivable.reduce((sum, item) => sum + item.eco, 0) /
        cityGreenLivable.length
      ).toFixed(2)
    ),
  },
  {
    name: "医疗养老",
    value: Number(
      (
        cityGreenLivable.reduce((sum, item) => sum + item.health, 0) /
        cityGreenLivable.length
      ).toFixed(2)
    ),
  },
  {
    name: "教育休闲",
    value: Number(
      (
        cityGreenLivable.reduce((sum, item) => sum + item.education, 0) /
        cityGreenLivable.length
      ).toFixed(2)
    ),
  },
  {
    name: "生活富足",
    value: Number(
      (
        cityGreenLivable.reduce((sum, item) => sum + item.life, 0) /
        cityGreenLivable.length
      ).toFixed(2)
    ),
  },
];

// 按综合指数排名（由高到低）生成的城市配色：亮绿 → 深青（呼应「绿色宜居」主题）。
// 风玫瑰图、散点图矩阵、平行坐标图共用同一套配色，保证同一城市在不同图表中颜色一致，
// 同时颜色本身也编码了排名（越亮绿综合指数越高，越宜居）。
const rankPalette = [
  "#A6F5C9",
  "#7CEAB0",
  "#52DD9B",
  "#34CE8D",
  "#27BE92",
  "#21AC9C",
  "#1F99A2",
  "#23859C",
  "#2C7290",
];

export const cityColorMap: Record<string, string> = cityGreenLivable.reduce(
  (acc, item, index) => {
    acc[item.city] = rankPalette[index] ?? "#2FC98E";
    return acc;
  },
  {} as Record<string, string>
);

export const topGreenLivableCities = cityGreenLivable.slice(0, 5);

const numericMean = (
  key:
    | "index"
    | "eco"
    | "health"
    | "education"
    | "life"
    | "urbanization"
    | "density"
    | "gdpPerCapita"
    | "population"
) =>
  Number(
    (
      cityGreenLivable.reduce((sum, c) => sum + c[key], 0) /
      cityGreenLivable.length
    ).toFixed(2)
  );

// 全省九市各指标均值，用于详情抽屉里的「优势 / 短板」对比。
export const provinceAvg = {
  index: numericMean("index"),
  eco: numericMean("eco"),
  health: numericMean("health"),
  education: numericMean("education"),
  life: numericMean("life"),
  urbanization: numericMean("urbanization"),
  density: numericMean("density"),
  gdpPerCapita: numericMean("gdpPerCapita"),
  population: numericMean("population"),
};

// 城市 → 综合指数排名（cityGreenLivable 已按综合指数降序排列）。
export const cityRankMap: Record<string, number> = cityGreenLivable.reduce(
  (acc, c, i) => {
    acc[c.city] = i + 1;
    return acc;
  },
  {} as Record<string, number>
);

// 详情抽屉中展示的四个核心宜居维度（0-100 标准化得分，可与全省均值直接比较）。
export const livableDimensions = [
  { key: "eco", name: "生态环境" },
  { key: "health", name: "医疗养老" },
  { key: "education", name: "教育文化" },
  { key: "life", name: "生活便利" },
] as const;

export const coastalCities = ["福州市", "泉州市", "厦门市"].map((city) => {
  const item = cityGreenLivable.find((entry) => entry.city === city);

  if (!item) {
    throw new Error(`Missing coastal city data: ${city}`);
  }

  return item;
});
