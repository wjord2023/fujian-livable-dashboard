import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface MapStyleStore {
  newStyle: boolean;
  pureMode: boolean;
  toggleMapStyle: () => void;
  togglePureMode: () => void;
}

export const useMapStyleStore = create<MapStyleStore>()(
  subscribeWithSelector((set) => ({
    newStyle: false,
    pureMode: false,
    toggleMapStyle: () => set((s) => ({ newStyle: !s.newStyle })),
    togglePureMode: () => set((s) => ({ pureMode: !s.pureMode })),
  }))
);
