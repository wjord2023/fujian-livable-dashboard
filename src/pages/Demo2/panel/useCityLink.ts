import { useEffect, type RefObject } from "react";
import type { EChartsType } from "echarts/core";
import { activeCitySelector, useConfigStore } from "../stores";

interface CityLinkOptions {
  /** 从 ECharts 事件参数解析出城市名（解析不到返回 null） */
  resolveCity: (params: unknown) => string | null;
  /** 根据当前高亮城市对图表做 highlight / downplay */
  applyHighlight: (chart: EChartsType, city: string | null) => void;
  /** 自定义点击处理；返回 true 表示已处理，不再执行默认城市选择。 */
  handleClick?: (params: unknown, chart: EChartsType) => boolean;
  /** 点击图元后的补充处理，例如记录点击点位置。 */
  onClickCity?: (
    params: unknown,
    selectedCity: string | null,
    chart: EChartsType
  ) => void;
  /**
   * 时间轴年份变化时更新图表数据（命令式 setOption）。可选。
   * 注意：年份变更会替换 series 数据并清掉强调态，因此 onYear 之后会自动重放当前高亮。
   */
  onYear?: (chart: EChartsType, year: number) => void;
}

/**
 * Chart 组件的 ref 要等到首次 ResizeObserver 触发后才会被赋值，
 * 这里用 requestAnimationFrame 轮询，待实例就绪后再回调。
 */
function whenChartReady(
  ref: RefObject<EChartsType | null>,
  cb: (chart: EChartsType) => void
) {
  let raf = 0;
  let cancelled = false;
  const tick = () => {
    if (cancelled) return;
    const chart = ref.current;
    if (chart) {
      cb(chart);
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  tick();
  return () => {
    cancelled = true;
    if (raf) cancelAnimationFrame(raf);
  };
}

/**
 * 把单个 ECharts 图表接入「城市联动高亮 + 时间轴联动」：
 * - 悬停/点击图元 → 写入全局 hovered / selected 城市
 * - 订阅全局高亮城市 → 命令式地 highlight / downplay 本图表（不触发 React 重渲染）
 * - 订阅全局年份 → 调用 onYear 更新数据，并重放当前高亮
 */
export function useCityLink(
  chartRef: RefObject<EChartsType | null>,
  { resolveCity, applyHighlight, handleClick, onClickCity, onYear }: CityLinkOptions
) {
  useEffect(() => {
    let chart: EChartsType | null = null;

    const { setHoveredCity, setSelectedCity } = useConfigStore.getState();
    const onOver = (p: unknown) => {
      const city = resolveCity(p);
      if (city) setHoveredCity(city);
    };
    const onOut = () => setHoveredCity(null);
    const onClick = (p: unknown) => {
      const c = chartRef.current ?? chart;
      if (c && handleClick?.(p, c)) return;
      const city = resolveCity(p);
      if (!city) return;
      const wasSelected = useConfigStore.getState().selectedCity === city;
      setSelectedCity(city);
      if (c) onClickCity?.(p, wasSelected ? null : city, c);
    };
    const onCanvasClick = (p: unknown) => {
      const c = chartRef.current ?? chart;
      if (c) handleClick?.(p, c);
    };

    const cancelReady = whenChartReady(chartRef, (c) => {
      chart = c;
      c.on("mouseover", onOver);
      c.on("mouseout", onOut);
      if (handleClick) {
        c.getZr().on("click", onCanvasClick);
      } else {
        c.on("click", onClick);
      }
      applyHighlight(c, activeCitySelector(useConfigStore.getState()));
    });

    const unsubCity = useConfigStore.subscribe(activeCitySelector, (city) => {
      if (chartRef.current) applyHighlight(chartRef.current, city);
    });

    const unsubYear = useConfigStore.subscribe(
      (s) => s.year,
      (year) => {
        const c = chartRef.current;
        if (!c || !onYear) return;
        onYear(c, year);
        applyHighlight(c, activeCitySelector(useConfigStore.getState()));
      }
    );

    return () => {
      cancelReady();
      if (chart) {
        chart.off("mouseover", onOver);
        chart.off("mouseout", onOut);
        if (handleClick) {
          chart.getZr().off("click", onCanvasClick);
        } else {
          chart.off("click", onClick);
        }
      }
      unsubCity();
      unsubYear();
    };
    // 仅在挂载时绑定一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
