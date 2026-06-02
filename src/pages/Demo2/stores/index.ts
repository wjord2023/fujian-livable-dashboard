import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface ConfigStore {
  mapPlayComplete: boolean;
  /** 鼠标悬停的城市（临时高亮，离开即清空） */
  hoveredCity: string | null;
  /** 点击锁定的城市（持续高亮 + 打开详情抽屉 + 相机聚焦） */
  selectedCity: string | null;
  setHoveredCity: (city: string | null) => void;
  /** 再次点击同一城市则取消选择；传入 null 直接关闭 */
  setSelectedCity: (city: string | null) => void;
  toggle: (key: "mapPlayComplete") => void;
  reset: () => void;
}

export const useConfigStore = create<ConfigStore>()(
  subscribeWithSelector((set, _, store) => ({
    mapPlayComplete: false,
    hoveredCity: null,
    selectedCity: null,
    setHoveredCity: (city) => set({ hoveredCity: city }),
    setSelectedCity: (city) =>
      set((s) => ({ selectedCity: s.selectedCity === city ? null : city })),
    toggle: (key) => set((s) => ({ [key]: !s[key] })),
    reset: () => set(store.getInitialState()),
  }))
);

/** 当前生效的高亮城市：优先取悬停，其次取选中。 */
export const activeCitySelector = (s: ConfigStore) =>
  s.hoveredCity ?? s.selectedCity;
