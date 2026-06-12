import { useEffect } from "react";
import styled from "styled-components";
import useMoveTo from "@/hooks/useMoveTo";
import AutoFit from "@/components/autoFit";
import { useConfigStore } from "../stores";

import Headder from "./headder";
import CityCard from "./cityCard";
import Timeline from "./timeline";
import Chart6 from "./chart6";
import Chart2 from "./chart2";
import Chart4 from "./chart4";
import Chart1 from "./chart1";
import Chart5 from "./chart5";
import Chart3 from "./chart3";

const GridWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(6, minmax(0, 1fr));
  gap: 20px;
  padding: 20px;
`;

const CardWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: 2;
`;

const CardTitle = styled.div`
  position: relative;
  font-size: 16px;
  color: #E6FBF1;
  border-bottom: 1px solid rgba(140, 225, 195, 0.33);
  line-height: 50px;
  margin-inline: 20px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 50px;
    height: 4px;
    background-color: #93E6C8;
  }

  &::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: 0;
    width: 4px;
    height: 4px;
    border-radius: 2px;
    background-color: #93E6C8;
  }
`;

const CardContent = styled.div`
  flex: 1;
  padding: 20px;
`;

// 卡片底部蒙版：半透明深色 + 轻微毛玻璃，把 3D 地图的高亮光柱压暗，
// 让图表文字 / 线条在前景清晰可读。SVG 边框绘制于其上，保持原科技感描边。
const CardBox = styled.div`
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: 6px;
    background:
      radial-gradient(
        130% 100% at 50% 0%,
        rgba(47, 201, 142, 0.07),
        transparent 62%
      ),
      linear-gradient(
        158deg,
        rgba(7, 26, 21, 0.82) 0%,
        rgba(4, 13, 22, 0.88) 100%
      );
    box-shadow: inset 0 0 26px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    pointer-events: none;
  }
`;

const Card = ({
  title,
  children,
  ...props
}: React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & { title: string }) => (
  <CardBox {...props}>
    <svg
      width="100%"
      height="100%"
      fill="none"
      viewBox="0 0 260 180"
      preserveAspectRatio="none"
      style={{ position: "relative", zIndex: 1 }}>
      <path
        fill="#2FC98E"
        fillRule="evenodd"
        d="M206 10 190 0H9L0 9v171h45l4.5-4h161l4.5 4h45V10h-54Zm53 1h-53.287l-16-10H9.414L1 9.414V179h43.62l4.5-4h161.76l4.5 4H259V11Z"
      />

      <path fill="#5FE3B8" d="m51 178-2 2h162l-2-2H51ZM0 0v7l7-7H0Z" />
      <path stroke="#5FE3B8" strokeWidth={2} d="M1 169v10h10M259 21V11h-10" />
    </svg>
    <CardWrapper>
      <CardTitle>{title}</CardTitle>
      <CardContent>{children}</CardContent>
    </CardWrapper>
  </CardBox>
);

export default function Panel() {
  const topBox = useMoveTo("toBottom", 0.6);
  const leftBox = useMoveTo("toRight", 0.8, 0.5);
  const leftBox1 = useMoveTo("toRight", 0.8, 0.6);
  const leftBox2 = useMoveTo("toRight", 0.8, 0.7);
  const rightBox = useMoveTo("toLeft", 0.8, 0.5);
  const rightBox1 = useMoveTo("toLeft", 0.8, 0.6);
  const rightBox2 = useMoveTo("toLeft", 0.8, 0.7);

  useEffect(() => {
    const unMapPlaySub = useConfigStore.subscribe(
      (s) => s.mapPlayComplete,
      (v) => {
        if (v) {
          topBox.restart();
          leftBox.restart();
          leftBox1.restart();
          leftBox2.restart();
          rightBox.restart();
          rightBox1.restart();
          rightBox2.restart();
        }
      }
    );

    return () => {
      unMapPlaySub();
    };
  }, []);

  return (
    <AutoFit>
      <Headder ref={topBox.ref} />
      <GridWrapper>
        <div></div>
        <Card
          ref={leftBox.ref}
          style={{ gridArea: "1 / 1 / 3 / 2" }}
          title="九市宜居指数·风玫瑰">
          <Chart1 />
        </Card>
        <Card
          ref={leftBox1.ref}
          style={{ gridArea: "3 / 1 / 5 / 2" }}
          title="九市指数·十年趋势">
          <Chart2 />
        </Card>
        <Card
          ref={leftBox2.ref}
          style={{ gridArea: "5 / 1 / 7 / 2" }}
          title="经济实力 × 宜居指数">
          <Chart3 />
        </Card>
        <Card
          ref={rightBox.ref}
          style={{ gridArea: "1 / 4 / 3 / 5" }}
          title="核心指标概览">
          <Chart4 />
        </Card>
        <Card
          ref={rightBox1.ref}
          style={{ gridArea: "3 / 4 / 5 / 5" }}
          title="九市维度·指标下钻">
          <Chart5 />
        </Card>
        <Card
          ref={rightBox2.ref}
          style={{ gridArea: "5 / 4 / 7 / 5" }}
          title="九市维度·平行坐标">
          <Chart6 />
        </Card>
      </GridWrapper>
      <CityCard />
      <Timeline />
    </AutoFit>
  );
}
