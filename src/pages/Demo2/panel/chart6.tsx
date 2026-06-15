import { useRef } from "react";
import Chart from "@/components/chart";
import { ParallelChart } from "echarts/charts";
import { ParallelComponent, TooltipComponent } from "echarts/components";
// 平行坐标系的 parallel / parallelAxis 类型无法通过 ComposeOption 干净组合
// （parallelAxis 的类型未单独导出），这里直接用完整的 EChartsOption 保证类型安全；
// 因为是 `import type`，构建时会被擦除，不影响按需引入的产物体积。
import type { EChartsOption } from "echarts";
import type { EChartsType } from "echarts/core";
import { citiesAtYear, cityColorMap, latestYear } from "../data";
import { useConfigStore } from "../stores";
import { useCityLink } from "./useCityLink";

// 平行坐标图：每条折线代表一个地市，跨越生态、医疗、教育、生活、城镇化五个维度，
// 默认铺开九市全量、点击某条线即聚焦该市；随时间轴推进，各折线逐年变化。
const dimensions = [
  { key: "eco", name: "生态" },
  { key: "health", name: "医疗" },
  { key: "education", name: "教育" },
  { key: "life", name: "生活" },
  { key: "urbanization", name: "城镇化" },
] as const;

// 城市名 → 平行坐标里的 dataIndex（按排名顺序固定，不随年份变化）。
const cityOrder = citiesAtYear(latestYear).map((c) => c.city);

const buildSeriesData = (year: number) =>
  citiesAtYear(year).map((city) => ({
    name: city.city,
    value: dimensions.map((dim) => city[dim.key]),
    lineStyle: {
      color: cityColorMap[city.city],
      width: 2,
      opacity: 0.7,
    },
  }));

export default function Chart6() {
  const chartRef = useRef<EChartsType>(null);

  useCityLink(chartRef, {
    resolveCity: (p) => {
      const pp = p as { name?: string; dataIndex?: number };
      if (pp.name) return pp.name;
      if (typeof pp.dataIndex === "number")
        return cityOrder[pp.dataIndex] ?? null;
      return null;
    },
    applyHighlight: (chart, city) => {
      chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
      if (city) {
        const dataIndex = cityOrder.indexOf(city);
        if (dataIndex >= 0)
          chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex });
      }
    },
    onYear: (chart, year) => {
      chart.setOption({ series: [{ data: buildSeriesData(year) }] });
    },
  });

  return (
    <Chart<EChartsOption>
      ref={chartRef}
      use={[ParallelChart, ParallelComponent, TooltipComponent]}
      option={{
        tooltip: {
          trigger: "item",
          confine: true,
          appendToBody: false,
          backgroundColor: "rgba(4, 13, 22, 0.92)",
          borderColor: "rgba(95, 227, 184, 0.62)",
          borderWidth: 1,
          extraCssText:
            "max-width:120px;box-sizing:border-box;border-radius:4px;box-shadow:0 0 14px rgba(0,0,0,.45);line-height:1.45;white-space:normal;",
          textStyle: { color: "rgba(230, 251, 241, 0.86)", fontSize: 11 },
          formatter: (params) => {
            const p = Array.isArray(params) ? params[0] : params;
            const v = p.value as number[];
            const rows = dimensions
              .map((dim, i) => `${dim.name}：${v[i]}`)
              .join("<br/>");
            return `<b style="color:#E6FBF1">${p.name}</b><br/>${rows}`;
          },
        },
        parallel: {
          left: "6%",
          right: "9%",
          top: "16%",
          bottom: "12%",
          parallelAxisDefault: {
            nameTextStyle: { color: "#93E6C8", fontSize: 11 },
            axisLine: { lineStyle: { color: "rgba(150, 230, 200, 0.35)" } },
            axisTick: { lineStyle: { color: "rgba(150, 230, 200, 0.35)" } },
            axisLabel: { color: "rgba(255, 255, 255, 0.5)", fontSize: 9 },
            splitLine: { show: false },
          },
        },
        parallelAxis: dimensions.map((dim, i) => ({
          dim: i,
          name: dim.name,
          min: 0,
          max: 100,
        })),
        series: [
          {
            type: "parallel",
            smooth: true,
            lineStyle: { width: 2, opacity: 0.7 },
            emphasis: {
              focus: "self",
              lineStyle: { width: 3.5, opacity: 1 },
            },
            blur: {
              lineStyle: { opacity: 0.08 },
            },
            data: buildSeriesData(useConfigStore.getState().year ?? latestYear),
          },
        ],
      }}
    />
  );
}
