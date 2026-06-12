import { useRef } from "react";
import Chart from "@/components/chart";
import type { ComposeOption, EChartsType } from "echarts/core";
import { LineChart, type LineSeriesOption } from "echarts/charts";
import {
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
  type GridComponentOption,
  type MarkLineComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import {
  cityIndexSeries,
  latestYear,
  years,
} from "../data";
import { useConfigStore } from "../stores";
import { useCityLink } from "./useCityLink";

type LineOption = ComposeOption<
  | LineSeriesOption
  | TooltipComponentOption
  | GridComponentOption
  | MarkLineComponentOption
>;

// 十年趋势：默认铺开九市的「绿色宜居指数」逐年轨迹（全部展示），
// 悬停 / 点击某条线即聚焦该市并联动其它图表；竖直标线跟随时间轴指示当前年份。
const yearLabels = years.map((y) => `${y}`);

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

const buildSeries = (markYear: number): LineSeriesOption[] =>
  cityIndexSeries.map((s, i) => ({
    name: s.city,
    type: "line",
    smooth: true,
    symbol: "circle",
    symbolSize: 4,
    showSymbol: false,
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

  useCityLink(chartRef, {
    resolveCity: (p) => (p as { seriesName?: string }).seriesName ?? null,
    applyHighlight: (chart, city) => {
      chart.dispatchAction({ type: "downplay" });
      const idx = cityIndexSeries.findIndex((s) => s.city === city);
      if (city && idx >= 0)
        chart.dispatchAction({ type: "highlight", seriesIndex: idx });
    },
    onYear: (chart, year) => {
      chart.setOption({ series: [{ markLine: yearMarkLine(year) }] });
    },
  });

  return (
    <Chart<LineOption>
      ref={chartRef}
      use={[LineChart, TooltipComponent, GridComponent, MarkLineComponent]}
      option={{
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#93E6C8",
          borderWidth: 1,
          textStyle: { color: "rgba(255, 255, 255, 0.85)", fontSize: 12 },
          formatter: (params) => {
            const p = Array.isArray(params) ? params[0] : params;
            return `${p.seriesName}<br/>${
              yearLabels[p.dataIndex as number]
            }　指数 ${p.value}`;
          },
        },
        grid: { top: 16, bottom: 22, left: 30, right: 14 },
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
