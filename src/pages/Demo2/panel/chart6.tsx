import { useRef } from "react";
import Chart from "@/components/chart";
import { ParallelChart } from "echarts/charts";
import { ParallelComponent, TooltipComponent } from "echarts/components";
// 平行坐标系的 parallel / parallelAxis 类型无法通过 ComposeOption 干净组合
// （parallelAxis 的类型未单独导出），这里直接用完整的 EChartsOption 保证类型安全；
// 因为是 `import type`，构建时会被擦除，不影响按需引入的产物体积。
import type { EChartsOption } from "echarts";
import type { EChartsType } from "echarts/core";
import { cityGreenLivable, cityColorMap } from "../data";
import { useCityLink } from "./useCityLink";

// 平行坐标图：每条折线代表一个地市，跨越生态、医疗、教育、生活、城镇化五个维度，
// 用于对比九市的多维表现、识别优势与短板，并观察沿海/山区等城市类型的整体差异。
const dimensions = [
  { key: "eco", name: "生态" },
  { key: "health", name: "医疗" },
  { key: "education", name: "教育" },
  { key: "life", name: "生活" },
  { key: "urbanization", name: "城镇化" },
] as const;

const seriesData = cityGreenLivable.map((city) => ({
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
        return seriesData[pp.dataIndex]?.name ?? null;
      return null;
    },
    applyHighlight: (chart, city) => {
      chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
      if (city) {
        const dataIndex = seriesData.findIndex((d) => d.name === city);
        if (dataIndex >= 0)
          chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex });
      }
    },
  });

  return (
    <Chart<EChartsOption>
      ref={chartRef}
      use={[ParallelChart, ParallelComponent, TooltipComponent]}
      option={{
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#93E6C8",
          borderWidth: 1,
          textStyle: { color: "rgba(255, 255, 255, 0.85)", fontSize: 12 },
          formatter: (params) => {
            const p = Array.isArray(params) ? params[0] : params;
            const v = p.value as number[];
            const rows = dimensions
              .map((dim, i) => `${dim.name}：${v[i]}`)
              .join("<br/>");
            return `${p.name}<br/>${rows}`;
          },
        },
        parallel: {
          left: "6%",
          right: "13%",
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
            data: seriesData,
          },
        ],
      }}
    />
  );
}
