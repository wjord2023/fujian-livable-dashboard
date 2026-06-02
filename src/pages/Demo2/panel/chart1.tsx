import { useRef } from "react";
import Chart from "@/components/chart";
import { PieChart, type PieSeriesOption } from "echarts/charts";
import {
  TooltipComponent,
  type TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption, EChartsType } from "echarts/core";
import { cityGreenLivable, cityColorMap } from "../data";
import { useCityLink } from "./useCityLink";

type RoseOption = ComposeOption<PieSeriesOption | TooltipComponentOption>;

// 风玫瑰图（南丁格尔玫瑰）：每一片花瓣代表一个地市，半径映射其绿色宜居综合指数，
// 直观呈现福建九市宜居水平的整体差异与排名。
const roseData = cityGreenLivable.map((item) => ({
  value: item.index,
  name: item.city,
  itemStyle: {
    color: cityColorMap[item.city],
    borderColor: "rgba(8, 18, 48, 0.55)",
    borderWidth: 1,
    shadowBlur: 8,
    shadowColor: cityColorMap[item.city],
  },
}));

export default function Chart1() {
  const chartRef = useRef<EChartsType>(null);

  useCityLink(chartRef, {
    resolveCity: (p) => (p as { name?: string }).name ?? null,
    applyHighlight: (chart, city) => {
      chart.dispatchAction({ type: "downplay", seriesIndex: 0 });
      if (city) chart.dispatchAction({ type: "highlight", seriesIndex: 0, name: city });
    },
  });

  return (
    <Chart<RoseOption>
      ref={chartRef}
      use={[PieChart, TooltipComponent]}
      option={{
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#93E6C8",
          borderWidth: 1,
          textStyle: { color: "rgba(255, 255, 255, 0.85)" },
          formatter: "{b}<br/>绿色宜居指数：{c} 分",
        },
        series: [
          {
            name: "绿色宜居指数",
            type: "pie",
            radius: [18, "76%"],
            center: ["50%", "52%"],
            roseType: "radius",
            startAngle: 90,
            itemStyle: {
              borderRadius: 4,
            },
            label: {
              color: "rgba(255, 255, 255, 0.78)",
              fontSize: 11,
              formatter: "{b}",
            },
            labelLine: {
              length: 4,
              length2: 6,
              lineStyle: { color: "rgba(189, 207, 255, 0.4)" },
            },
            emphasis: {
              focus: "self",
              scaleSize: 8,
              label: {
                fontSize: 12,
                fontWeight: "bold",
                color: "#fff",
              },
            },
            blur: {
              itemStyle: { opacity: 0.2 },
              label: { opacity: 0.35 },
            },
            data: roseData,
          },
        ],
      }}
    />
  );
}
