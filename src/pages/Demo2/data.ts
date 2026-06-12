import realDataJson from "./realData.json";

// ──────────────────────────────────────────────────────────────────────────
// 数据来源：fujian_green_livable_2015_2024/ 官方源表（福建九市 2015–2024 真实统计）。
// realData.json 由源表抽取生成，含 5 个维度得分 + 城镇化率 / 人均GDP / 人口 / 密度。
//
// 维度口径：
//   - 生态环境(eco) / 生活便利(life) / 空间承载(space)：直接采用源表标准化得分；
//   - 医疗养老(health) / 教育文化(education)：源表原始得分只用「每万人/每百人」人均口径，
//     会让人口稀疏的内陆市虚高（如三明 > 厦门），不符合常理。这里改为
//     「人均得分 × 0.5 + 绝对总量得分 × 0.5」的混合口径，兼顾资源规模与人均可得性。
//   - 综合指数(index)：按官方权重 生态30% 医疗20% 教育20% 生活20% 空间承载10%
//     对 5 个维度得分加权重算（负向指标在源表中已反向标准化）。
// ──────────────────────────────────────────────────────────────────────────

export type CityMetricKey =
  | "index"
  | "eco"
  | "health"
  | "education"
  | "life"
  | "space"
  | "urbanization"
  | "gdpPerCapita"
  | "population"
  | "density";

export interface CityYear extends Record<CityMetricKey, number> {
  city: string;
  year: number;
}

const realData = realDataJson as CityYear[];

const round = (x: number, d = 2) => Number(x.toFixed(d));

// ── 年份轴 ──
export const years = [...new Set(realData.map((d) => d.year))].sort(
  (a, b) => a - b
);
export const firstYear = years[0];
export const latestYear = years[years.length - 1];

// ── 分城市逐年真实序列 ──
export const cityTrendData: Record<string, CityYear[]> = {};
realData.forEach((d) => {
  (cityTrendData[d.city] ??= []).push(d);
});
Object.values(cityTrendData).forEach((arr) =>
  arr.sort((a, b) => a.year - b.year)
);

// 2024 快照，按真实综合指数降序排列（决定排名 / 配色顺序）。
export const cityGreenLivable: CityYear[] = realData
  .filter((d) => d.year === latestYear)
  .slice()
  .sort((a, b) => b.index - a.index);

/** 指定年份全部九市的数据（保持 cityGreenLivable 的排名顺序）。 */
export const citiesAtYear = (year: number): CityYear[] =>
  cityGreenLivable.map(
    (c) =>
      cityTrendData[c.city].find((d) => d.year === year) ??
      cityTrendData[c.city][cityTrendData[c.city].length - 1]
  );

/** 指定城市在指定年份的数据。 */
export const cityAtYear = (city: string, year: number): CityYear | null =>
  cityTrendData[city]?.find((d) => d.year === year) ?? null;

/** 指定年份的全省各维度均值（用于 KPI、雷达基准线、详情卡对比刻度）。 */
export const provinceAvgAtYear = (year: number) => {
  const arr = citiesAtYear(year);
  const mean = (key: CityMetricKey) =>
    arr.reduce((s, c) => s + c[key], 0) / arr.length;
  return {
    index: round(mean("index")),
    eco: round(mean("eco")),
    health: round(mean("health")),
    education: round(mean("education")),
    life: round(mean("life")),
    space: round(mean("space")),
    urbanization: round(mean("urbanization")),
    gdpPerCapita: Math.round(mean("gdpPerCapita")),
    population: Math.round(mean("population")),
    density: round(mean("density"), 1),
  };
};

// ── 全省十年趋势（由真实逐年数据按年求均值）──
export const greenLivableTrend = years.map((year) => {
  const a = provinceAvgAtYear(year);
  return {
    year,
    index: a.index,
    urbanization: a.urbanization,
    eco: a.eco,
    life: a.life,
  };
});

const provAvgLatest = provinceAvgAtYear(latestYear);
const provAvgFirst = provinceAvgAtYear(firstYear);

export const greenLivableSummary = {
  latestYear,
  cityCount: cityGreenLivable.length,
  avgIndex: provAvgLatest.index,
  avgUrbanization: provAvgLatest.urbanization,
  avgGdpPerCapita: provAvgLatest.gdpPerCapita,
  avgEco: provAvgLatest.eco,
  improvement: round(provAvgLatest.index - provAvgFirst.index),
};

// 四个核心宜居维度的全省 2024 均值。
export const dimensionAverages = [
  { name: "生态环境", value: provAvgLatest.eco },
  { name: "医疗养老", value: provAvgLatest.health },
  { name: "教育休闲", value: provAvgLatest.education },
  { name: "生活富足", value: provAvgLatest.life },
];

// 按综合指数排名（由高到低）生成的城市配色：亮绿 → 深青（呼应「绿色宜居」主题）。
// 风玫瑰图、气泡图、平行坐标图共用同一套配色，保证同一城市在不同图表中颜色一致，
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

// 全省九市各指标 2024 均值，用于详情抽屉里的「优势 / 短板」对比。
export const provinceAvg = provAvgLatest;

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

/** 趋势折线图用：每个城市的「绿色宜居指数」十年序列。 */
export const cityIndexSeries = cityGreenLivable.map((c) => ({
  city: c.city,
  color: cityColorMap[c.city],
  data: cityTrendData[c.city].map((d) => d.index),
}));

// ── 地图按「分数深浅」着色：指数越高越亮绿，越低越暗沉。 ──
const hexToRgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ] as const;
};
const rgbToHex = (r: number, g: number, b: number) => {
  const c = (x: number) =>
    Math.round(Math.max(0, Math.min(255, x)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
};
const mixHex = (a: string, b: string, t: number) => {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
};

const allIndexValues = realData.map((d) => d.index);
export const indexDomain = {
  min: Math.min(...allIndexValues),
  max: Math.max(...allIndexValues),
};

const SCORE_LOW = "#0d4332"; // 低分：暗沉深绿
const SCORE_MID = "#2FC98E";
const SCORE_HIGH = "#BFFFDD"; // 高分：明亮翠绿

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// 0–1 归一化分数 → 绿色深浅（低→暗，高→亮）。
const scoreToColor = (t: number) =>
  t < 0.5
    ? mixHex(SCORE_LOW, SCORE_MID, t / 0.5)
    : mixHex(SCORE_MID, SCORE_HIGH, (t - 0.5) / 0.5);

/** 把绿色宜居指数映射成绿色深浅（按「全部年份」全局区间）。 */
export const indexColor = (v: number) => {
  const { min, max } = indexDomain;
  const t = max > min ? clamp01((v - min) / (max - min)) : 0.5;
  return scoreToColor(t);
};

/** 指定年份九市「绿色宜居指数」的取值区间。 */
export const yearIndexDomain = (year: number) => {
  const arr = citiesAtYear(year).map((c) => c.index);
  return { min: Math.min(...arr), max: Math.max(...arr) };
};

/**
 * 按「当年九市分布」给城市着色：当年最高分→最亮翠绿，最低分→最暗深绿。
 * 相比全局 indexColor，同一年里各市的深浅对比被显著拉开，便于在地图上一眼看出高低。
 */
export const indexColorAt = (v: number, year: number) => {
  const { min, max } = yearIndexDomain(year);
  const span = max - min || 1;
  // 区间两端各留一点余量，避免最低分被压成纯黑、最高分顶到极亮。
  const lo = min - span * 0.12;
  const hi = max + span * 0.04;
  return scoreToColor(clamp01((v - lo) / (hi - lo)));
};
