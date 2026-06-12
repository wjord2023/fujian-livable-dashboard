import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useRafInterval from "@/hooks/useRafInterval";
import { firstYear, latestYear, years } from "../data";
import { useConfigStore } from "../stores";

const STEP_MS = 1300;

const Wrap = styled.div`
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 28;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 26px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    rgba(8, 32, 25, 0.85),
    rgba(6, 20, 30, 0.85)
  );
  border: 1px solid rgba(95, 227, 184, 0.32);
  box-shadow: 0 0 24px rgba(47, 201, 142, 0.18),
    inset 0 0 24px rgba(47, 201, 142, 0.05);
  backdrop-filter: blur(6px);
  pointer-events: auto;
  user-select: none;
`;

const PlayBtn = styled.button`
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid #5fe3b8;
  background: rgba(95, 227, 184, 0.12);
  color: #aefadd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;

  &:hover {
    background: rgba(95, 227, 184, 0.24);
    box-shadow: 0 0 12px rgba(95, 227, 184, 0.5);
  }

  svg {
    display: block;
  }
`;

const YearNow = styled.div`
  flex-shrink: 0;
  width: 56px;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #e6fbf1;
  text-shadow: 0 0 14px rgba(95, 227, 184, 0.7);
  font-variant-numeric: tabular-nums;
`;

const Track = styled.div`
  position: relative;
  width: 480px;
  height: 30px;
  display: flex;
  align-items: center;
`;

const Rail = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  top: 9px;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.12);
`;

const Progress = styled.div<{ $pct: number }>`
  position: absolute;
  left: 0;
  top: 9px;
  height: 3px;
  width: ${(p) => p.$pct}%;
  border-radius: 2px;
  background: linear-gradient(90deg, #21ac9c, #5fe3b8);
  box-shadow: 0 0 8px rgba(95, 227, 184, 0.7);
  transition: width 0.4s ease;
`;

const Ticks = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Tick = styled.button<{ $active: boolean }>`
  position: relative;
  width: 26px;
  height: 30px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;

  &::before {
    content: "";
    width: ${(p) => (p.$active ? "12px" : "8px")};
    height: ${(p) => (p.$active ? "12px" : "8px")};
    margin-top: ${(p) => (p.$active ? "3px" : "5px")};
    border-radius: 50%;
    background: ${(p) => (p.$active ? "#aefadd" : "rgba(95,227,184,0.45)")};
    box-shadow: ${(p) =>
      p.$active ? "0 0 10px rgba(174,250,221,0.9)" : "none"};
    transition: all 0.2s;
  }

  span {
    font-size: 10px;
    color: ${(p) => (p.$active ? "#aefadd" : "rgba(230,251,241,0.4)")};
    font-variant-numeric: tabular-nums;
  }

  &:hover span {
    color: #aefadd;
  }
`;

const PlayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
    <path d="M2 1.5v9l8-4.5z" />
  </svg>
);
const PauseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 12 12" fill="currentColor">
    <rect x="2" y="1.5" width="3" height="9" rx="1" />
    <rect x="7" y="1.5" width="3" height="9" rx="1" />
  </svg>
);

export default function Timeline() {
  const mapPlayComplete = useConfigStore((s) => s.mapPlayComplete);
  const year = useConfigStore((s) => s.year);
  const setYear = useConfigStore((s) => s.setYear);
  const [playing, setPlaying] = useState(false);
  const startedRef = useRef(false);

  // 开场动画结束后，从 2015 开始自动播放一遍到 2024。
  useEffect(() => {
    if (mapPlayComplete && !startedRef.current) {
      startedRef.current = true;
      setYear(firstYear);
      setPlaying(true);
    }
  }, [mapPlayComplete, setYear]);

  useRafInterval(
    () => {
      const cur = useConfigStore.getState().year;
      if (cur >= latestYear) {
        setPlaying(false);
        return;
      }
      const idx = years.indexOf(cur);
      setYear(years[Math.min(idx + 1, years.length - 1)]);
    },
    playing ? STEP_MS : 0
  );

  const onToggle = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (year >= latestYear) setYear(firstYear);
      setPlaying(true);
    }
  };

  const pick = (y: number) => {
    setPlaying(false);
    setYear(y);
  };

  if (!mapPlayComplete) return null;

  const pct = (years.indexOf(year) / (years.length - 1)) * 100;

  return (
    <Wrap>
      <PlayBtn onClick={onToggle} aria-label={playing ? "暂停" : "播放"}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </PlayBtn>
      <YearNow>{year}</YearNow>
      <Track>
        <Rail />
        <Progress $pct={pct} />
        <Ticks>
          {years.map((y) => (
            <Tick
              key={y}
              $active={y === year}
              onClick={() => pick(y)}
              aria-label={`${y}`}>
              <span>{`'${`${y}`.slice(2)}`}</span>
            </Tick>
          ))}
        </Ticks>
      </Track>
    </Wrap>
  );
}
