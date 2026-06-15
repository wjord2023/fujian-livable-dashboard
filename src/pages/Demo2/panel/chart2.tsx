import { useRef } from "react";
import Chart from "@/components/chart";
import type { ComposeOption, EChartsType } from "echarts/core";
import { LineChart, type LineSeriesOption } from "echarts/charts";
import {
  GridComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent,
  type GridComponentOption,
  type MarkLineComponentOption,
  type MarkPointComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import { cityIndexSeries, latestYear, years } from "../data";
import { activeCitySelector, useConfigStore } from "../stores";
import { useCityLink } from "./useCityLink";

type LineOption = ComposeOption<
  | LineSeriesOption
  | TooltipComponentOption
  | GridComponentOption
  | MarkLineComponentOption
  | MarkPointComponentOption
>;

// 十年趋势：默认铺开九市的「绿色宜居指数」逐年轨迹（全部展示），
// 悬停 / 点击某条线即聚焦该市并联动其它图表；竖直标线跟随时间轴指示当前年份。
const yearLabels = years.map((y) => `${y}`);

type LineEventParam = {
  seriesName?: string;
  componentType?: string;
  seriesIndex?: number;
  dataIndex?: number;
  event?: { offsetX?: number; offsetY?: number };
};

type TrendTagState = {
  city: string;
  yearIndex: number;
};

type PixelPoint = [number, number];

type ZrClickParam = {
  offsetX?: number;
  offsetY?: number;
  event?: { offsetX?: number; offsetY?: number };
};

const resolveTrendCity = (params: unknown) => {
  const p = params as LineEventParam;

  if (p?.seriesName) return p.seriesName;
  if (p?.componentType === "series" && typeof p.seriesIndex === "number")
    return cityIndexSeries[p.seriesIndex]?.city ?? null;
  return null;
};

const yearMarkLine = (year: number): LineSeriesOption["markLine"] => ({
  silent: true,
  symbol: "none",
  label: {
    show: true,
    formatter: `${year}`,
    color: "#E6FBF1",
    fontSize: 10,
    position: "start",
  },
  lineStyle: {
    color: "rgba(230, 251, 241, 0.55)",
    type: "dashed",
    width: 1,
  },
  data: [{ xAxis: `${year}` }],
});

const cityMarkPoint = (
  yearIndex: number,
  series: (typeof cityIndexSeries)[number]
): LineSeriesOption["markPoint"] => {
  const value = series.data[yearIndex] ?? series.data[series.data.length - 1];

  return {
    silent: true,
    symbol: "circle",
    symbolSize: 7,
    itemStyle: {
      color: series.color,
      borderColor: "rgba(230, 251, 241, 0.85)",
      borderWidth: 1.2,
      shadowBlur: 12,
      shadowColor: `${series.color}aa`,
    },
    label: {
      show: true,
      position: "top",
      distance: 8,
      formatter: `{city|${series.city}}\n{meta|${yearLabels[yearIndex]}  指数 }{value|${value}}`,
      color: "#E6FBF1",
      fontSize: 11,
      fontWeight: "bold",
      lineHeight: 16,
      padding: [5, 8],
      borderRadius: 4,
      backgroundColor: "rgba(4, 13, 22, 0.9)",
      borderColor: "rgba(95, 227, 184, 0.6)",
      borderWidth: 1,
      shadowBlur: 12,
      shadowColor: "rgba(0, 0, 0, 0.45)",
      rich: {
        city: {
          color: "rgba(230, 251, 241, 0.9)",
          fontSize: 11,
          fontWeight: 700,
        },
        meta: {
          color: "rgba(230, 251, 241, 0.72)",
          fontSize: 10,
          fontWeight: 500,
        },
        value: {
          color: series.color,
          fontSize: 12,
          fontWeight: 700,
        },
      },
    },
    data: [
      {
        name: series.city,
        coord: [yearLabels[yearIndex] ?? `${years[yearIndex]}`, value],
      },
    ],
  };
};

const resolveTrendYearIndex = (params: unknown, chart: EChartsType) => {
  const p = params as LineEventParam & ZrClickParam;

  if (typeof p?.dataIndex === "number" && p.dataIndex >= 0) {
    return Math.min(p.dataIndex, yearLabels.length - 1);
  }

  const offsetX =
    typeof p.offsetX === "number" ? p.offsetX : p.event?.offsetX;
  const offsetY =
    typeof p.offsetY === "number" ? p.offsetY : p.event?.offsetY;

  if (
    typeof offsetX === "number" &&
    typeof offsetY === "number"
  ) {
    const converted = chart.convertFromPixel(
      { gridIndex: 0 },
      [offsetX, offsetY]
    ) as unknown as [number | string, number];
    const x = converted?.[0];
    const index =
      typeof x === "number" ? Math.round(x) : yearLabels.indexOf(String(x));

    if (index >= 0 && index < yearLabels.length) return index;
  }

  return Math.max(0, years.indexOf(useConfigStore.getState().year ?? latestYear));
};

const distanceToSegment = (
  p: PixelPoint,
  a: PixelPoint,
  b: PixelPoint
) => {
  const vx = b[0] - a[0];
  const vy = b[1] - a[1];
  const wx = p[0] - a[0];
  const wy = p[1] - a[1];
  const lenSq = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / lenSq));
  const x = a[0] + vx * t;
  const y = a[1] + vy * t;

  return {
    distance: Math.hypot(p[0] - x, p[1] - y),
    t,
  };
};

const findNearestTrendLine = (
  chart: EChartsType,
  offsetX: number,
  offsetY: number
): TrendTagState | null => {
  if (!chart.containPixel({ gridIndex: 0 }, [offsetX, offsetY])) return null;

  let best:
    | {
        city: string;
        yearIndex: number;
        distance: number;
      }
    | null = null;

  for (const series of cityIndexSeries) {
    for (let i = 0; i < series.data.length - 1; i += 1) {
      const a = chart.convertToPixel({ gridIndex: 0 }, [
        yearLabels[i],
        series.data[i],
      ]) as PixelPoint;
      const b = chart.convertToPixel({ gridIndex: 0 }, [
        yearLabels[i + 1],
        series.data[i + 1],
      ]) as PixelPoint;
      if (!Array.isArray(a) || !Array.isArray(b)) continue;

      const hit = distanceToSegment([offsetX, offsetY], a, b);
      if (!best || hit.distance < best.distance) {
        best = {
          city: series.city,
          yearIndex: Math.min(yearLabels.length - 1, Math.round(i + hit.t)),
          distance: hit.distance,
        };
      }
    }
  }

  return best && best.distance <= 12
    ? { city: best.city, yearIndex: best.yearIndex }
    : null;
};

const syncTrendState = (
  chart: EChartsType,
  city: string | null,
  tag: TrendTagState | null,
  year = useConfigStore.getState().year ?? latestYear
) => {
  const visibleTag = city && tag?.city === city ? tag : null;

  chart.setOption({
    series: cityIndexSeries.map((s, i) => ({
      z: city === s.city ? 3 : 1,
      lineStyle: {
        color: s.color,
        width: city === s.city ? 3.2 : 2,
        opacity: city ? (city === s.city ? 1 : 0.14) : 0.62,
      },
      markLine: i === 0 ? yearMarkLine(year) : undefined,
      markPoint:
        visibleTag?.city === s.city
          ? cityMarkPoint(visibleTag.yearIndex, s)
          : { data: [] },
    })),
  });
};

const buildSeries = (markYear: number): LineSeriesOption[] =>
  cityIndexSeries.map((s, i) => ({
    name: s.city,
    type: "line",
    smooth: true,
    symbol: "circle",
    symbolSize: 4,
    showSymbol: false,
    triggerLineEvent: true,
    data: s.data,
    lineStyle: { color: s.color, width: 2, opacity: 0.62 },
    itemStyle: { color: s.color },
    emphasis: {
      focus: "series",
      lineStyle: { width: 3.4, opacity: 1 },
    },
    blur: {
      lineStyle: { opacity: 0.1 },
    },
    ...(i === 0 ? { markLine: yearMarkLine(markYear) } : {}),
  }));

export default function Chart2() {
  const chartRef = useRef<EChartsType>(null);
  const clickedTagRef = useRef<TrendTagState | null>(null);

  useCityLink(chartRef, {
    resolveCity: resolveTrendCity,
    applyHighlight: (chart, city) => {
      syncTrendState(chart, city, clickedTagRef.current);
    },
    handleClick: (params, chart) => {
      const p = params as ZrClickParam;
      const offsetX =
        typeof p.offsetX === "number" ? p.offsetX : p.event?.offsetX;
      const offsetY =
        typeof p.offsetY === "number" ? p.offsetY : p.event?.offsetY;

      if (typeof offsetX !== "number" || typeof offsetY !== "number")
        return false;

      const nearest = findNearestTrendLine(chart, offsetX, offsetY);
      if (!nearest) return true;

      const wasSelected =
        useConfigStore.getState().selectedCity === nearest.city;
      useConfigStore.getState().setSelectedCity(nearest.city);
      clickedTagRef.current = wasSelected
        ? null
        : { city: nearest.city, yearIndex: nearest.yearIndex };
      syncTrendState(
        chart,
        activeCitySelector(useConfigStore.getState()),
        clickedTagRef.current
      );
      return true;
    },
    onClickCity: (params, selectedCity, chart) => {
      clickedTagRef.current = selectedCity
        ? { city: selectedCity, yearIndex: resolveTrendYearIndex(params, chart) }
        : null;
      syncTrendState(
        chart,
        activeCitySelector(useConfigStore.getState()),
        clickedTagRef.current
      );
    },
    onYear: (chart, year) => {
      syncTrendState(
        chart,
        activeCitySelector(useConfigStore.getState()),
        clickedTagRef.current,
        year
      );
    },
  });

  return (
    <Chart<LineOption>
      ref={chartRef}
      use={[
        LineChart,
        TooltipComponent,
        GridComponent,
        MarkLineComponent,
        MarkPointComponent,
      ]}
      option={{
        tooltip: {
          show: false,
          trigger: "axis",
          confine: true,
          axisPointer: {
            type: "line",
            lineStyle: {
              color: "rgba(230, 251, 241, 0.55)",
              type: "dashed",
              width: 1,
            },
          },
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#93E6C8",
          borderWidth: 1,
          textStyle: { color: "rgba(255, 255, 255, 0.85)", fontSize: 12 },
          formatter: (params) => {
            const list = Array.isArray(params) ? params : [params];
            const primary =
              list.find((p) => p.seriesName === useConfigStore.getState().hoveredCity) ??
              list.find((p) => p.seriesName === useConfigStore.getState().selectedCity) ??
              list[0];

            return `<b style="color:#E6FBF1">${primary?.seriesName ?? ""}</b><br/>${
              yearLabels[primary.dataIndex as number]
            }　指数 ${primary.value}`;
          },
        },
        grid: { top: 22, bottom: 22, left: 30, right: 14 },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: yearLabels,
          axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.12)" } },
          axisTick: { show: false },
          axisLabel: {
            color: "rgba(255, 255, 255, 0.55)",
            fontSize: 10,
            interval: 1,
          },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 100,
          splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.05)" } },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "rgba(255, 255, 255, 0.5)", fontSize: 10 },
        },
        series: buildSeries(useConfigStore.getState().year ?? latestYear),
      }}
    />
  );
}
