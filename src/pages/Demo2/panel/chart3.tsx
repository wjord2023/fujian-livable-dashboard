import { useRef } from "react";
import Chart from "@/components/chart";
import { ScatterChart, type ScatterSeriesOption } from "echarts/charts";
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  type GridComponentOption,
  type TitleComponentOption,
  type TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption, EChartsType } from "echarts/core";
import { cityGreenLivable, cityColorMap } from "../data";
import { useCityLink } from "./useCityLink";

type MatrixOption = ComposeOption<
  | ScatterSeriesOption
  | GridComponentOption
  | TitleComponentOption
  | TooltipComponentOption
>;

// 散点图矩阵：在「综合指数 / 生态环境 / 生活富足」三个维度之间两两绘制散点，
// 帮助识别各维度与综合宜居水平之间的相关关系（如生活富足与综合指数高度正相关）。
const matrixVars: { key: "index" | "eco" | "life"; name: string }[] = [
  { key: "index", name: "综合" },
  { key: "eco", name: "生态" },
  { key: "life", name: "生活" },
];

const N = matrixVars.length;
// 以百分比定义每个子图（grid）在画布中的位置，预留坐标轴与标题空间。
const padL = 7;
const padR = 4;
const padT = 7;
const padB = 7;
const gap = 6;
const cellW = (100 - padL - padR - gap * (N - 1)) / N;
const cellH = (100 - padT - padB - gap * (N - 1)) / N;

const cells = matrixVars.flatMap((_row, r) =>
  matrixVars.map((_col, c) => ({
    r,
    c,
    i: r * N + c,
    left: padL + c * (cellW + gap),
    top: padT + r * (cellH + gap),
  }))
);

const axisCommon = {
  scale: true,
  axisLabel: { show: false },
  axisTick: { show: false },
  axisLine: { lineStyle: { color: "rgba(150, 230, 200, 0.18)" } },
  splitLine: { lineStyle: { color: "rgba(255, 255, 255, 0.04)" } },
};

export default function Chart3() {
  const chartRef = useRef<EChartsType>(null);

  useCityLink(chartRef, {
    resolveCity: (p) => (p as { name?: string }).name ?? null,
    applyHighlight: (chart, city) => {
      chart.dispatchAction({ type: "downplay" });
      if (city) chart.dispatchAction({ type: "highlight", name: city });
    },
  });

  return (
    <Chart<MatrixOption>
      ref={chartRef}
      use={[ScatterChart, GridComponent, TitleComponent, TooltipComponent]}
      option={{
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#93E6C8",
          borderWidth: 1,
          textStyle: { color: "rgba(255, 255, 255, 0.85)", fontSize: 12 },
          formatter: (params) => {
            const p = Array.isArray(params) ? params[0] : params;
            const cell = cells[(p.seriesIndex as number) ?? 0];
            const v = p.value as number[];
            return `${p.name}<br/>${matrixVars[cell.c].name}：${v[0]}<br/>${
              matrixVars[cell.r].name
            }：${v[1]}`;
          },
        },
        grid: cells.map((cell) => ({
          left: `${cell.left}%`,
          top: `${cell.top}%`,
          width: `${cellW}%`,
          height: `${cellH}%`,
        })),
        xAxis: cells.map((cell) => ({ ...axisCommon, gridIndex: cell.i })),
        yAxis: cells.map((cell) => ({ ...axisCommon, gridIndex: cell.i })),
        title: cells
          .filter((cell) => cell.r === cell.c)
          .map((cell) => ({
            text: matrixVars[cell.r].name,
            left: `${cell.left + cellW / 2}%`,
            top: `${cell.top + cellH / 2}%`,
            textAlign: "center",
            textVerticalAlign: "middle",
            textStyle: {
              color: "#93E6C8",
              fontSize: 14,
              fontWeight: "bold" as const,
            },
          })),
        series: cells.map((cell) => ({
          type: "scatter",
          xAxisIndex: cell.i,
          yAxisIndex: cell.i,
          symbolSize: 8,
          emphasis: { focus: "self", scale: 1.6 },
          blur: { itemStyle: { opacity: 0.12 } },
          data:
            cell.r === cell.c
              ? []
              : cityGreenLivable.map((city) => ({
                  value: [city[matrixVars[cell.c].key], city[matrixVars[cell.r].key]],
                  name: city.city,
                  itemStyle: {
                    color: cityColorMap[city.city],
                    borderColor: "rgba(255, 255, 255, 0.35)",
                    borderWidth: 0.5,
                    shadowBlur: 6,
                    shadowColor: cityColorMap[city.city],
                  },
                })),
        })),
      }}
    />
  );
}
