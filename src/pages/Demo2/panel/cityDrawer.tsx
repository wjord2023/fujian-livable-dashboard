import { useRef } from "react";
import styled from "styled-components";
import {
  cityColorMap,
  cityGreenLivable,
  cityRankMap,
  livableDimensions,
  provinceAvg,
} from "../data";
import { useConfigStore } from "../stores";

type City = (typeof cityGreenLivable)[number];

const Wrap = styled.div<{ $open: boolean; $accent: string }>`
  position: absolute;
  left: 50%;
  bottom: 30px;
  width: 880px;
  transform: translateX(-50%)
    translateY(${(p) => (p.$open ? "0" : "150%")});
  opacity: ${(p) => (p.$open ? 1 : 0)};
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s;
  pointer-events: ${(p) => (p.$open ? "auto" : "none")};
  z-index: 30;
  display: flex;
  align-items: stretch;
  gap: 26px;
  padding: 18px 30px 20px;
  border-radius: 12px;
  color: #e6fbf1;
  background: linear-gradient(
    135deg,
    rgba(8, 32, 25, 0.93),
    rgba(6, 20, 30, 0.93)
  );
  border: 1px solid ${(p) => p.$accent}66;
  box-shadow: 0 0 30px ${(p) => p.$accent}33,
    inset 0 0 36px rgba(47, 201, 142, 0.06);
  backdrop-filter: blur(6px);
`;

const Close = styled.button`
  position: absolute;
  top: 10px;
  right: 14px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: rgba(230, 251, 241, 0.6);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
`;

const Identity = styled.div`
  flex: 0 0 168px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  border-right: 1px solid rgba(150, 230, 200, 0.18);
  padding-right: 10px;
`;

const Rank = styled.div<{ $accent: string }>`
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 12px;
  color: rgba(230, 251, 241, 0.55);

  b {
    font-size: 22px;
    color: ${(p) => p.$accent};
    font-weight: 700;
  }
`;

const CityName = styled.div`
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
`;

const IndexLine = styled.div<{ $accent: string }>`
  font-size: 13px;
  color: rgba(230, 251, 241, 0.7);

  b {
    font-size: 18px;
    color: ${(p) => p.$accent};
    margin: 0 2px;
  }
`;

const Dims = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, auto);
  gap: 8px 22px;
  align-content: center;
`;

const DimRow = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr 64px;
  align-items: center;
  gap: 8px;
  font-size: 12px;
`;

const DimName = styled.span`
  color: rgba(230, 251, 241, 0.78);
`;

const Track = styled.div`
  position: relative;
  height: 7px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
`;

const Fill = styled.div<{ $w: number; $accent: string }>`
  height: 100%;
  width: ${(p) => p.$w}%;
  border-radius: 4px;
  background: ${(p) => p.$accent};
  box-shadow: 0 0 8px ${(p) => p.$accent}aa;
  transition: width 0.5s ease;
`;

const AvgTick = styled.span<{ $left: number }>`
  position: absolute;
  top: -2px;
  bottom: -2px;
  left: ${(p) => p.$left}%;
  width: 1px;
  background: rgba(255, 255, 255, 0.55);
`;

const DimVal = styled.span<{ $up: boolean }>`
  text-align: right;
  white-space: nowrap;

  b {
    color: #fff;
  }
  i {
    font-style: normal;
    margin-left: 4px;
    color: ${(p) => (p.$up ? "#5FE3B8" : "#ffb35c")};
  }
`;

const Context = styled.div`
  flex: 0 0 196px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 14px;
  align-content: center;
  border-left: 1px solid rgba(150, 230, 200, 0.18);
  padding-left: 18px;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;

  span {
    font-size: 11px;
    color: rgba(230, 251, 241, 0.5);
  }
  b {
    font-size: 15px;
    color: #e6fbf1;
    font-weight: 600;
  }
`;

const Tags = styled.div`
  position: absolute;
  top: 12px;
  left: 30px;
  display: flex;
  gap: 6px;
`;

const Tag = styled.span<{ $type: "up" | "down" }>`
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 10px;
  color: ${(p) => (p.$type === "up" ? "#5FE3B8" : "#ffb35c")};
  background: ${(p) =>
    p.$type === "up" ? "rgba(95,227,184,0.12)" : "rgba(255,179,92,0.12)"};
  border: 1px solid
    ${(p) => (p.$type === "up" ? "rgba(95,227,184,0.4)" : "rgba(255,179,92,0.4)")};
`;

export default function CityDrawer() {
  const selectedCity = useConfigStore((s) => s.selectedCity);
  const setSelectedCity = useConfigStore((s) => s.setSelectedCity);
  const lastCity = useRef<City | null>(null);

  const city = cityGreenLivable.find((c) => c.city === selectedCity) ?? null;
  if (city) lastCity.current = city;
  const shown = city ?? lastCity.current;

  const accent = shown ? cityColorMap[shown.city] : "#2FC98E";
  const strengths = shown
    ? livableDimensions.filter((d) => shown[d.key] >= provinceAvg[d.key])
    : [];
  const weaknesses = shown
    ? livableDimensions.filter((d) => shown[d.key] < provinceAvg[d.key])
    : [];

  return (
    <Wrap $open={!!city} $accent={accent}>
      {shown && (
        <>
          <Close onClick={() => setSelectedCity(null)} aria-label="关闭">
            ×
          </Close>

          <Tags>
            {strengths.slice(0, 2).map((d) => (
              <Tag key={d.key} $type="up">
                优势·{d.name}
              </Tag>
            ))}
            {weaknesses.slice(0, 2).map((d) => (
              <Tag key={d.key} $type="down">
                短板·{d.name}
              </Tag>
            ))}
          </Tags>

          <Identity>
            <Rank $accent={accent}>
              全省第 <b>{cityRankMap[shown.city]}</b> / {cityGreenLivable.length}
            </Rank>
            <CityName>{shown.city}</CityName>
            <IndexLine $accent={accent}>
              绿色宜居指数 <b>{shown.index}</b> 分
            </IndexLine>
          </Identity>

          <Dims>
            {livableDimensions.map((d) => {
              const value = shown[d.key];
              const avg = provinceAvg[d.key];
              const delta = Number((value - avg).toFixed(1));
              return (
                <DimRow key={d.key}>
                  <DimName>{d.name}</DimName>
                  <Track>
                    <Fill
                      $w={Math.min(100, value)}
                      $accent={accent}
                    />
                    <AvgTick $left={Math.min(100, avg)} />
                  </Track>
                  <DimVal $up={delta >= 0}>
                    <b>{value}</b>
                    <i>
                      {delta >= 0 ? "▲" : "▼"}
                      {Math.abs(delta)}
                    </i>
                  </DimVal>
                </DimRow>
              );
            })}
          </Dims>

          <Context>
            <Stat>
              <span>城镇化率</span>
              <b>{shown.urbanization}%</b>
            </Stat>
            <Stat>
              <span>常住人口</span>
              <b>{shown.population} 万</b>
            </Stat>
            <Stat>
              <span>人口密度</span>
              <b>{shown.density}</b>
            </Stat>
            <Stat>
              <span>人均GDP</span>
              <b>{(shown.gdpPerCapita / 10000).toFixed(2)} 万</b>
            </Stat>
          </Context>
        </>
      )}
    </Wrap>
  );
}
