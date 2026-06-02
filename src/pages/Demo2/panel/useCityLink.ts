import { useEffect, type RefObject } from "react";
import type { EChartsType } from "echarts/core";
import { activeCitySelector, useConfigStore } from "../stores";

interface CityLinkOptions {
  /** 从 ECharts 事件参数解析出城市名（解析不到返回 null） */
  resolveCity: (params: unknown) => string | null;
  /** 根据当前高亮城市对图表做 highlight / downplay */
  applyHighlight: (chart: EChartsType, city: string | null) => void;
}

/**
 * 把单个 ECharts 图表接入「城市联动高亮」：
 * - 悬停/点击图元 → 写入全局 hovered / selected 城市
 * - 订阅全局高亮城市 → 命令式地 highlight / downplay 本图表（不触发 React 重渲染）
 *
 * 注意：Chart 组件的 ref 要等到首次 ResizeObserver 触发后才会被赋值，
 * 因此这里用 requestAnimationFrame 轮询，待实例就绪后再绑定事件。
 */
export function useCityLink(
  chartRef: RefObject<EChartsType | null>,
  { resolveCity, applyHighlight }: CityLinkOptions
) {
  useEffect(() => {
    let chart: EChartsType | null = null;
    let raf = 0;

    const { setHoveredCity, setSelectedCity } = useConfigStore.getState();
    const onOver = (p: unknown) => {
      const city = resolveCity(p);
      if (city) setHoveredCity(city);
    };
    const onOut = () => setHoveredCity(null);
    const onClick = (p: unknown) => {
      const city = resolveCity(p);
      if (city) setSelectedCity(city);
    };

    const bind = () => {
      chart = chartRef.current;
      if (!chart) {
        raf = requestAnimationFrame(bind);
        return;
      }
      chart.on("mouseover", onOver);
      chart.on("mouseout", onOut);
      chart.on("click", onClick);
      applyHighlight(chart, activeCitySelector(useConfigStore.getState()));
    };
    bind();

    const unsubscribe = useConfigStore.subscribe(activeCitySelector, (city) => {
      if (chartRef.current) applyHighlight(chartRef.current, city);
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (chart) {
        chart.off("mouseover", onOver);
        chart.off("mouseout", onOut);
        chart.off("click", onClick);
      }
      unsubscribe();
    };
    // 仅在挂载时绑定一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
