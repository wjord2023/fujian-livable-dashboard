import styled from "styled-components";
import NumberAnimation from "@/components/numberAnimation";
import {
  citiesAtYear,
  cityAtYear,
  cityColorMap,
  firstYear,
  greenLivableSummary,
  provinceAvgAtYear,
} from "../data";
import { useConfigStore } from "../stores";

const NUMBER_TWEEN_DURATION = 0.45;

const numberOptions = (digits = 0): Intl.NumberFormatOptions => ({
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
});

const icons = {
  city: (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M715.294118 180.705882h128c15.058824 0 30.117647-12.54902 30.117647-30.117647 0-15.058824-12.54902-30.117647-30.117647-30.117647h-128c-15.058824 0-30.117647 12.54902-30.117647 30.117647s12.54902 30.117647 30.117647 30.117647zM1104.313725 0c-82.823529 0-150.588235 67.764706-150.588235 153.098039 0 82.823529 67.764706 153.098039 150.588235 153.098039s150.588235-67.764706 150.588236-153.098039C1254.901961 67.764706 1187.137255 0 1104.313725 0z m0 245.960784c-50.196078 0-92.862745-42.666667-92.862745-92.862745s40.156863-92.862745 92.862745-92.862745c50.196078 0 92.862745 42.666667 92.862746 92.862745S1154.509804 245.960784 1104.313725 245.960784z m-376.470588 240.941177h-188.235294c-7.529412 0-160.627451-22.588235-160.627451-163.137255 0-135.529412 140.54902-140.54902 155.607843-140.54902h47.686275c15.058824 0 27.607843-15.058824 27.607843-30.117647s-12.54902-27.607843-27.607843-30.117647h-47.686275c-72.784314 0-213.333333 42.666667-213.333333 200.784314 0 155.607843 138.039216 213.333333 213.333333 223.372549h188.235294c7.529412 0 160.627451 22.588235 160.627451 163.137255 0 135.529412-140.54902 140.54902-155.607843 140.549019H298.666667c-10.039216-75.294118-72.784314-130.509804-148.078432-130.509804-82.823529 0-150.588235 67.764706-150.588235 153.09804 0 82.823529 67.764706 150.588235 150.588235 150.588235 70.27451 0 130.509804-50.196078 145.568628-115.45098H727.843137c75.294118 0 213.333333-42.666667 213.333334-200.784314 0-155.607843-138.039216-213.333333-213.333334-220.862745zM150.588235 966.27451c-50.196078 0-92.862745-42.666667-92.862745-92.862745C57.72549 820.705882 100.392157 778.039216 150.588235 778.039216s92.862745 42.666667 92.862745 92.862745C240.941176 923.607843 200.784314 966.27451 150.588235 966.27451z"></path>
    </svg>
  ),
  index: (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M650.752 556.3904L510.5664 504.7808l63.8464-205.568-225.792 231.168 119.1424 65.024-64.4096 184.0128z"></path>
      <path d="M773.9904 975.36H240.64c-33.3312 0-62.208-13.3632-85.8112-39.7824-23.552-26.4192-35.4816-58.7264-35.4816-96.0512v-352.256c0-16.7936 12.1344-30.4128 27.136-30.4128 14.9504 0 27.0848 13.6192 27.0848 30.3616v352.3072c0 20.9408 6.4 38.2976 19.6096 53.0944 13.2608 14.848 28.7744 22.016 47.4624 22.016h533.3504c18.688 0 34.1504-7.168 47.36-22.016 13.312-14.848 19.712-32.2048 19.712-53.0944v-352.256c0-16.7936 12.1344-30.4128 27.136-30.4128 14.9504 0 27.136 13.6192 27.136 30.3616v352.3072c0 37.376-11.9808 69.632-35.6352 96.0512-23.552 26.4192-52.3776 39.8336-85.7088 39.8336z m218.88-535.6544a25.088 25.088 0 0 1-15.4624-5.376L505.1392 67.5328 43.008 427.776c-12.288 9.5744-29.184 6.144-37.7344-7.5776-8.5504-13.824-5.5296-32.768 6.7584-42.2912L489.5744 5.5808a24.7808 24.7808 0 0 1 30.976 0l487.7824 378.7776c12.288 9.5744 15.36 28.5184 6.8608 42.2912a26.368 26.368 0 0 1-22.3232 13.056z"></path>
    </svg>
  ),
  urban: (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M904 456h-56c-30.9 0-56 25.1-56 56 0 154.4-125.6 280-280 280S232 666.4 232 512s125.6-280 280-280c22.9 0 42.5-13.9 51.2-33.6h220.4c4.6 0 8.4-3.8 8.4-8.4 0-4.6-3.8-8.4-8.4-8.4H566.9c0.2-1.9 1.1-3.6 1.1-5.6v-19.6h215.6c4.6 0 8.4-3.8 8.4-8.4 0-4.6-3.8-8.4-8.4-8.4H568V120c0-2-0.9-3.7-1.1-5.6h216.7c4.6 0 8.4-3.8 8.4-8.4 0-4.6-3.8-8.4-8.4-8.4H563.2C554.5 77.9 534.9 64 512 64 264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448c0-30.9-25.1-56-56-56zM512 904c-216.1 0-392-175.9-392-392s175.9-392 392-392v56c-185.6 0-336 150.4-336 336s150.4 336 336 336 336-150.4 336-336h56c0 216.1-175.9 392-392 392z"></path>
    </svg>
  ),
  gdp: (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M512 64c247.424 0 448 200.576 448 448s-200.576 448-448 448S64 759.424 64 512 264.576 64 512 64z m0 64C299.925333 128 128 299.925333 128 512s171.925333 384 384 384 384-171.925333 384-384S724.074667 128 512 128z"></path>
      <path d="M247.04 829.546667A32 32 0 0 1 199.68 786.56l2.069333-2.282667 568.512-568.490666a32 32 0 0 1 47.317334 42.986666l-2.069334 2.282667L247.04 829.546667zM436.906667 362.666667a32 32 0 0 1 3.093333 63.850666l-3.072 0.149334H256a32 32 0 0 1-3.072-63.850667L256 362.666667h180.906667zM509.056 651.157333c55.744-64.938667 117.973333-76.565333 171.242667-26.666666l3.626666 3.52c24.746667 24.661333 46.293333 21.077333 81.130667-19.52a32 32 0 0 1 48.554667 41.685333c-55.744 64.938667-117.973333 76.565333-171.242667 26.666667l-3.626667-3.52c-24.746667-24.661333-46.293333-21.077333-81.130666 19.52a32 32 0 0 1-48.554667-41.685334z"></path>
    </svg>
  ),
};

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 10px;
`;

// 作用域徽标：未选中=「全省九市」，选中某市=「城市名 · 第N」，明确当前指标的口径。
const Scope = styled.div<{ $accent: string }>`
  position: absolute;
  top: -34px;
  right: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 9px;
  color: ${(p) => p.$accent};
  background: ${(p) => p.$accent}1f;
  border: 1px solid ${(p) => p.$accent}55;
  pointer-events: none;
  white-space: nowrap;
  transition: color 0.4s, background 0.4s, border-color 0.4s;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${(p) => p.$accent};
    box-shadow: 0 0 8px ${(p) => p.$accent};
  }
`;

const Statistics1 = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: rgba(255, 255, 255, 0.8);
`;

const Info = styled.div`
  min-width: 0;
  flex: 1;
`;

const Statistics1Number = styled(NumberAnimation)`
  display: inline-block;
  min-width: 4.5ch;
  text-align: right;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
  color: #2fc98e;
  text-shadow: 0 0 10px currentColor;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  transition: color 0.4s;
`;

const Statistics2Number = styled(NumberAnimation)`
  display: inline-block;
  min-width: 3.8ch;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  color: #93e6c8;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
`;

const CompanyIcon = styled.div<{ $accent: string }>`
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid ${(p) => p.$accent};
  padding: 0.42em;
  font-size: 1.5em;
  box-shadow: 0 0 10px ${(p) => p.$accent};
  transition: border-color 0.4s, box-shadow 0.4s;

  svg {
    display: block;
  }
`;

const Sign = styled.span<{ $up: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${(p) => (p.$up ? "#5fe3b8" : "#ffb35c")};
`;

const Item = styled.div`
  display: flex;
  gap: 3px;
  align-items: baseline;
  white-space: nowrap;
  font-size: 11px;
`;

interface Stat {
  label: string;
  value: number;
  unit: string;
  digits?: number;
  label2: string;
  value2: number;
  unit2: string;
  digits2?: number;
  /** 第二行作为「与全省对比」的差值：带 +/- 号并按正负着色（绿/橙）。 */
  delta2?: boolean;
  icon: React.ReactNode;
}

export default function Chart4() {
  const year = useConfigStore((s) => s.year);
  const selectedCity = useConfigStore((s) => s.selectedCity);
  const avg = provinceAvgAtYear(year);
  const base = provinceAvgAtYear(firstYear);

  const cityData = selectedCity ? cityAtYear(selectedCity, year) : null;
  const accent =
    selectedCity && cityColorMap[selectedCity]
      ? cityColorMap[selectedCity]
      : "#2fc98e";

  const cityList = citiesAtYear(year);
  const rank = cityData
    ? [...cityList].sort((a, b) => b.index - a.index).findIndex(
        (c) => c.city === selectedCity
      ) + 1
    : 0;

  // 选中城市 → 该市具体指标（含与全省对比）；未选中 → 全省九市概览。
  const provinceStats: Stat[] = [
    {
      label: "覆盖城市",
      value: greenLivableSummary.cityCount,
      unit: "个",
      label2: "统计年份",
      value2: year,
      unit2: "年",
      icon: icons.city,
    },
    {
      label: "综合指数",
      value: avg.index,
      unit: "分",
      label2: "较2015",
      value2: Number((avg.index - base.index).toFixed(2)),
      unit2: "分",
      digits: 2,
      icon: icons.index,
    },
    {
      label: "城镇化率",
      value: avg.urbanization,
      unit: "%",
      label2: "生态得分",
      value2: avg.eco,
      unit2: "分",
      digits: 1,
      icon: icons.urban,
    },
    {
      label: "人均GDP",
      value: avg.gdpPerCapita / 10000,
      unit: "万元",
      label2: "原始均值",
      value2: avg.gdpPerCapita,
      unit2: "元/人",
      digits: 2,
      digits2: 0,
      icon: icons.gdp,
    },
  ];

  const cityStats: Stat[] = cityData
    ? [
        {
          label: "综合指数",
          value: cityData.index,
          unit: "分",
          digits: 2,
          label2: "全省排名",
          value2: rank,
          unit2: `/${cityList.length}`,
          digits2: 0,
          icon: icons.index,
        },
        {
          label: "城镇化率",
          value: cityData.urbanization,
          unit: "%",
          digits: 1,
          label2: "较全省",
          value2: Number((cityData.urbanization - avg.urbanization).toFixed(1)),
          unit2: "%",
          digits2: 1,
          delta2: true,
          icon: icons.urban,
        },
        {
          label: "人均GDP",
          value: cityData.gdpPerCapita / 10000,
          unit: "万元",
          digits: 2,
          label2: "常住人口",
          value2: cityData.population,
          unit2: "万",
          digits2: 0,
          icon: icons.gdp,
        },
        {
          label: "生态环境",
          value: cityData.eco,
          unit: "分",
          digits: 1,
          label2: "较全省",
          value2: Number((cityData.eco - avg.eco).toFixed(1)),
          unit2: "分",
          digits2: 1,
          delta2: true,
          icon: icons.city,
        },
      ]
    : [];

  const data = cityData ? cityStats : provinceStats;

  return (
    <Wrapper>
      <Scope $accent={accent}>
        {cityData ? `${selectedCity} · 第 ${rank}` : "全省九市概览"}
      </Scope>
      {data.map((el) => {
        const up = el.value2 >= 0;
        return (
          <Statistics1 key={`${el.label}-${el.label2}`}>
            <CompanyIcon $accent={accent}>{el.icon}</CompanyIcon>
            <Info>
              <Item>
                <span>{el.label}</span>
                <Statistics1Number
                  value={el.value}
                  duration={NUMBER_TWEEN_DURATION}
                  options={numberOptions(el.digits)}
                  style={{ color: accent }}
                />
                <span>{el.unit}</span>
              </Item>
              <Item>
                <span>{el.label2}</span>
                {el.delta2 && up && <Sign $up>+</Sign>}
                <Statistics2Number
                  value={el.value2}
                  duration={NUMBER_TWEEN_DURATION}
                  options={numberOptions(el.digits2 ?? el.digits)}
                  style={
                    el.delta2
                      ? { color: up ? "#5fe3b8" : "#ffb35c" }
                      : undefined
                  }
                />
                <span>{el.unit2}</span>
              </Item>
            </Info>
          </Statistics1>
        );
      })}
    </Wrapper>
  );
}
