import { useRef } from "react";
import Chart from "@/components/chart";
import { ScatterChart, type ScatterSeriesOption } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  type GridComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption, EChartsType } from "echarts/core";
import { citiesAtYear, cityColorMap, latestYear } from "../data";
import { useConfigStore } from "../stores";
import { useCityLink } from "./useCityLink";

type BubbleOption = ComposeOption<
  ScatterSeriesOption | GridComponentOption | TooltipComponentOption
>;

// 「经济实力 × 宜居指数」气泡图：
//   x = 人均 GDP（万元，经济实力）  y = 绿色宜居指数  气泡大小 = 常住人口  颜色 = 综合排名
// 一张图把「越有钱是否越宜居」「人口体量」三个维度同时讲清楚，
// 比原先 4×4 的散点矩阵直观得多，且随时间轴推进可看到九市整体向右上方迁移。

// 人口 → 气泡半径（按 sqrt 近似面积编码，跨年份固定，便于横向比较）。
const bubbleSize = (population: number) => 13 + Math.sqrt(population) * 1.05;

const buildSeries = (year: number): ScatterSeriesOption[] => [
  {
    type: "scatter",
    symbolSize: (val) => bubbleSize((val as number[])[2]),
    emphasis: {
      focus: "self",
      scale: 1.25,
      label: { show: true, fontWeight: "bold", color: "#fff" },
    },
    blur: { itemStyle: { opacity: 0.18 }, label: { opacity: 0.2 } },
    labelLayout: { hideOverlap: true },
    label: {
      show: true,
      position: "top",
      distance: 3,
      color: "rgba(230, 251, 241, 0.82)",
      fontSize: 10,
      formatter: (p) => (p.data as { name: string }).name,
    },
    data: citiesAtYear(year).map((c) => ({
      name: c.city,
      value: [
        Number((c.gdpPerCapita / 10000).toFixed(2)),
        c.index,
        c.population,
      ],
      itemStyle: {
        color: cityColorMap[c.city],
        borderColor: "rgba(6, 20, 16, 0.85)",
        borderWidth: 1,
        opacity: 0.92,
        shadowBlur: 10,
        shadowColor: cityColorMap[c.city],
      },
    })),
  },
];

const axisCommon = {
  nameTextStyle: { color: "#93E6C8", fontSize: 11 },
  axisLine: { lineStyle: { color: "rgba(150, 230, 200, 0.3)" } },
  axisLabel: { color: "rgba(255, 255, 255, 0.55)", fontSize: 10 },
  splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.05)" } },
} as const;

export default function Chart3() {
  const chartRef = useRef<EChartsType>(null);

  useCityLink(chartRef, {
    resolveCity: (p) => (p as { name?: string }).name ?? null,
    applyHighlight: (chart, city) => {
      chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
      if (city)
        chart.dispatchAction({ type: "highlight", seriesIndex: 0, name: city });
    },
    onYear: (chart, year) => {
      chart.setOption({ series: buildSeries(year) });
    },
  });

  return (
    <Chart<BubbleOption>
      ref={chartRef}
      use={[ScatterChart, GridComponent, TooltipComponent]}
      option={{
        grid: { left: 46, right: 18, top: 22, bottom: 34 },
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#93E6C8",
          borderWidth: 1,
          textStyle: { color: "rgba(255, 255, 255, 0.85)", fontSize: 12 },
          formatter: (params) => {
            const p = Array.isArray(params) ? params[0] : params;
            const v = p.value as number[];
            return `${p.name}<br/>宜居指数：${v[1]} 分<br/>人均GDP：${v[0]} 万元<br/>常住人口：${v[2]} 万`;
          },
        },
        xAxis: {
          type: "value",
          name: "人均GDP / 万元",
          nameGap: 22,
          nameLocation: "middle",
          scale: true,
          ...axisCommon,
        },
        yAxis: {
          type: "value",
          name: "宜居指数",
          nameGap: 14,
          scale: true,
          ...axisCommon,
        },
        series: buildSeries(useConfigStore.getState().year ?? latestYear),
      }}
    />
  );
}
