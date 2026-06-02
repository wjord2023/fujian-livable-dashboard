import { useRef } from "react";
import { RadarChart, type RadarSeriesOption } from "echarts/charts";
import Chart from "@/components/chart";
import type { ComposeOption, EChartsType } from "echarts/core";
import {
  LegendComponent,
  TooltipComponent,
  type LegendComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import { coastalCities, cityColorMap } from "../data";
import { useCityLink } from "./useCityLink";

type PieOption = ComposeOption<
  RadarSeriesOption | TooltipComponentOption | LegendComponentOption
>;

const indicator = [
  { key: "eco", name: "生态环境" },
  { key: "health", name: "医疗养老" },
  { key: "education", name: "教育休闲" },
  { key: "life", name: "生活富足" },
].map((item) => ({
  name: item.name,
  max: 100,
}));

const data = coastalCities.map((item) => ({
  name: item.city,
  value: [item.eco, item.health, item.education, item.life],
  itemStyle: { color: cityColorMap[item.city] },
  lineStyle: { color: cityColorMap[item.city], width: 2 },
  areaStyle: { color: cityColorMap[item.city], opacity: 0.1 },
}));

export default function Chart5() {
  const chartRef = useRef<EChartsType>(null);

  useCityLink(chartRef, {
    resolveCity: (p) => (p as { name?: string }).name ?? null,
    applyHighlight: (chart, city) => {
      chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
      const dataIndex = coastalCities.findIndex((c) => c.city === city);
      if (city && dataIndex >= 0)
        chart.dispatchAction({ type: "highlight", seriesIndex: 0, dataIndex });
    },
  });

  return (
    <Chart<PieOption>
      ref={chartRef}
      use={[RadarChart, TooltipComponent, LegendComponent]}
      option={{
        radar: {
          center: ["50%", "44%"],
          radius: "58%",
          axisName: {
            color: "#93E6C8",
            fontSize: 11,
          },
          axisNameGap: 6,
          indicator: indicator,
          splitLine: {
            show: false,
          },
          splitArea: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        legend: {
          bottom: 0,
          textStyle: {
            color: "rgba(255,255,255,0.72)",
          },
          itemWidth: 10,
          itemHeight: 10,
          data: coastalCities.map((item) => item.city),
        },
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(0, 0, 0,0.8)",
          borderColor: "#93E6C8",
          borderWidth: 1,
          textStyle: {
            color: "rgba(255, 255, 255,0.8)",
          },
        },
        series: [
          {
            type: "radar",
            data,
            label: { show: false },
            symbolSize: [6, 6],
            lineStyle: {
              width: 2,
            },
            areaStyle: {
              color: "#93E6C8",
              opacity: 0.16,
            },
            emphasis: { focus: "self" },
            blur: {
              areaStyle: { opacity: 0.03 },
              lineStyle: { opacity: 0.15 },
            },
          },
          {
            type: "radar",
            data: [[100, 100, 100, 100, 100]],
            symbol: "none",
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              color: "#34CE8D",
            },
            areaStyle: {
              color: "#34CE8D",
              opacity: 0.06,
            },
          },
          {
            type: "radar",
            data: [[85, 85, 85, 85, 85]],
            symbol: "none",
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              color: "#22ABA6",
            },
            areaStyle: {
              color: "#22ABA6",
              opacity: 0.12,
            },
          },
          {
            type: "radar",
            data: [[70, 70, 70, 70, 70]],
            symbol: "none",
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              color: "#2FC98E",
            },
            areaStyle: {
              color: "#2FC98E",
              opacity: 0.18,
            },
          },
          {
            type: "radar",
            data: [[55, 55, 55, 55, 55]],
            symbol: "none",
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              color: "#2FC98E",
            },
            areaStyle: {
              color: "#2FC98E",
              opacity: 0.19,
            },
          },
          {
            type: "radar",
            data: [[40, 40, 40, 40, 40]],
            symbol: "none",
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              color: "#2FC98E",
            },
            areaStyle: {
              color: "#2FC98E",
              opacity: 0.17,
            },
          },
          {
            type: "radar",
            data: [[25, 25, 25, 25, 25]],
            symbol: "none",
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              color: "#2FC98E",
            },
            areaStyle: {
              color: "#2FC98E",
              opacity: 0.16,
            },
          },
          {
            type: "radar",
            data: [[10, 10, 10, 10, 10]],
            symbol: "none",
            lineStyle: {
              width: 0,
            },
            itemStyle: {
              color: "#2FC98E",
            },
            areaStyle: {
              color: "#2FC98E",
              opacity: 0.13,
            },
          },
        ],
      }}
    />
  );
}
