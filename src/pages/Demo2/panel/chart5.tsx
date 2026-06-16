import { useState } from "react";
import styled from "styled-components";
import drillJson from "../drillData.json";
import { cityColorMap } from "../data";
import { activeCitySelector, useConfigStore } from "../stores";

// 九市维度·指标下钻：选一个维度 → 看支撑它的真实原始指标在九市间的对比，
// 补上「原始指标 → 维度得分」这一环，也露出全屏其它图未呈现的底层硬数据
// （每万人医师/床位、人均收入、宽带普及、单位GDP污染强度、人口密度…）。
// 随时间轴年份刷新；悬停/点击条形 → 与地图及其它图表联动高亮。

interface DrillRow {
  city: string;
  year: number;
  [indicator: string]: number | string;
}
const drill = drillJson as DrillRow[];

interface Item {
  key: string;
  name: string;
  unit: string;
  neg?: boolean; // 负向：越低越优
}
const GROUPS: { dim: string; items: Item[] }[] = [
  {
    dim: "生态",
    items: [
      { key: "eco_so2", name: "单位GDP·SO₂", unit: "吨/亿元", neg: true },
      { key: "eco_nox", name: "单位GDP·氮氧化物", unit: "吨/亿元", neg: true },
      { key: "eco_dust", name: "单位GDP·烟尘", unit: "吨/亿元", neg: true },
    ],
  },
  {
    dim: "医疗",
    items: [
      { key: "med_bed", name: "每万人床位", unit: "床" },
      { key: "med_doc", name: "每万人执业医师", unit: "人" },
      { key: "med_staff", name: "每万人卫技人员", unit: "人" },
      { key: "med_welfare", name: "每万人福利床位", unit: "床" },
    ],
  },
  {
    dim: "教育",
    items: [
      { key: "edu_primteacher", name: "每万人小学教师", unit: "人" },
      { key: "edu_secteacher", name: "每万人中学教师", unit: "人" },
      { key: "edu_books", name: "每百人图书藏书", unit: "册" },
      { key: "edu_sport", name: "每万人文体设施", unit: "个" },
    ],
  },
  {
    dim: "生活",
    items: [
      { key: "life_gdp", name: "人均GDP", unit: "元" },
      { key: "life_urbinc", name: "城镇人均收入", unit: "元" },
      { key: "life_rurinc", name: "农村人均收入", unit: "元" },
      { key: "life_broadband", name: "宽带普及", unit: "户/百人" },
      { key: "life_mobile", name: "移动电话", unit: "户/百人" },
    ],
  },
  {
    dim: "空间",
    items: [
      { key: "space_urb", name: "城镇化率", unit: "%" },
      { key: "space_density", name: "人口密度", unit: "人/km²", neg: true },
      { key: "space_land", name: "人均土地", unit: "m²/人" },
      { key: "space_pop", name: "年末总人口", unit: "万" },
    ],
  },
];

const fmt = (v: number) =>
  v >= 1000
    ? Math.round(v).toLocaleString("en-US")
    : Number.isInteger(v)
    ? String(v)
    : v.toFixed(1);

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  font-variant-numeric: tabular-nums;
`;

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  min-width: 0;
`;

const Tab = styled.button<{ $on: boolean }>`
  flex: 1;
  min-width: 0;
  font-size: 10px;
  padding: 4px 0;
  border-radius: 5px;
  cursor: pointer;
  color: ${(p) => (p.$on ? "#06140f" : "rgba(230,251,241,0.7)")};
  background: ${(p) => (p.$on ? "#5FE3B8" : "rgba(95,227,184,0.08)")};
  border: 1px solid
    ${(p) => (p.$on ? "#5FE3B8" : "rgba(95,227,184,0.25)")};
  font-weight: ${(p) => (p.$on ? 700 : 500)};
  transition: all 0.2s;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 5px;
  margin: 7px 0 5px;
  flex: 0 0 auto;
  max-height: 45px;
  overflow: hidden;
`;

const Chip = styled.button<{ $on: boolean }>`
  font-size: 10px;
  max-width: 100%;
  padding: 2px 7px;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(p) => (p.$on ? "#aefadd" : "rgba(230,251,241,0.55)")};
  background: ${(p) => (p.$on ? "rgba(95,227,184,0.16)" : "transparent")};
  border: 1px solid
    ${(p) => (p.$on ? "rgba(95,227,184,0.55)" : "rgba(140,225,195,0.2)")};
  transition: all 0.2s;
`;

const Meta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 11px;
  color: rgba(147, 230, 200, 0.8);
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(140, 225, 195, 0.16);

  b {
    color: #e6fbf1;
    font-size: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  i {
    margin-left: auto;
    font-style: normal;
    font-size: 10px;
    color: rgba(255, 179, 92, 0.85);
  }
`;

const Body = styled.div`
  flex: 1;
  display: grid;
  grid-template-rows: repeat(9, minmax(0, 1fr));
  gap: 1px;
  padding-top: 4px;
  min-height: 0;
  overflow: hidden;
`;

const Row = styled.div<{ $on: boolean; $accent: string }>`
  min-height: 0;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) minmax(42px, 56px);
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 0 2px;
  border-radius: 4px;
  background: ${(p) => (p.$on ? `${p.$accent}24` : "transparent")};
  transition: background 0.2s;
  overflow: hidden;

  &:hover {
    background: ${(p) => `${p.$accent}18`};
  }
`;

const CityName = styled.span`
  font-size: 11px;
  color: #e6fbf1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Track = styled.div`
  height: 9px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
  min-width: 0;
`;

const Fill = styled.div<{ $w: number; $accent: string }>`
  height: 100%;
  width: ${(p) => p.$w}%;
  border-radius: 5px;
  background: linear-gradient(
    90deg,
    ${(p) => p.$accent}99,
    ${(p) => p.$accent}
  );
  box-shadow: 0 0 8px ${(p) => p.$accent}88;
  transition: width 0.5s ease;
`;

const Val = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-align: right;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default function Chart5() {
  const [dimIdx, setDimIdx] = useState(3); // 默认「生活」
  const [itemKey, setItemKey] = useState("life_gdp"); // 默认「人均GDP」

  const year = useConfigStore((s) => s.year);
  const active = useConfigStore(activeCitySelector);
  const setHovered = useConfigStore((s) => s.setHoveredCity);
  const setSelected = useConfigStore((s) => s.setSelectedCity);

  const group = GROUPS[dimIdx];
  const item = group.items.find((i) => i.key === itemKey) ?? group.items[0];

  const rows = drill
    .filter((r) => r.year === year)
    .map((r) => ({ city: r.city, value: Number(r[item.key] ?? 0) }))
    .sort((a, b) => (item.neg ? a.value - b.value : b.value - a.value));
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <Wrap>
      <Tabs>
        {GROUPS.map((g, i) => (
          <Tab
            key={g.dim}
            $on={i === dimIdx}
            onClick={() => {
              setDimIdx(i);
              setItemKey(g.items[0].key);
            }}>
            {g.dim}
          </Tab>
        ))}
      </Tabs>

      <Chips>
        {group.items.map((it) => (
          <Chip
            key={it.key}
            $on={it.key === item.key}
            onClick={() => setItemKey(it.key)}>
            {it.name}
          </Chip>
        ))}
      </Chips>

      <Meta>
        <b>{item.name}</b>
        <span>（{item.unit}）</span>
        {item.neg && <i>↓ 越低越优</i>}
      </Meta>

      <Body>
        {rows.map((r) => {
          const accent = cityColorMap[r.city] ?? "#2FC98E";
          return (
            <Row
              key={r.city}
              $on={active === r.city}
              $accent={accent}
              onMouseEnter={() => setHovered(r.city)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected(r.city)}>
              <CityName>{r.city.replace("市", "")}</CityName>
              <Track>
                <Fill $w={(r.value / max) * 100} $accent={accent} />
              </Track>
              <Val>{fmt(r.value)}</Val>
            </Row>
          );
        })}
      </Body>
    </Wrap>
  );
}
