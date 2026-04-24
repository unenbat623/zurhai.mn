import { create } from 'zustand';

export type AppTab = 'horoscope' | 'chart' | 'compatibility' | 'tarot' | 'shop' | 'numerology';

interface AppState {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'horoscope',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
