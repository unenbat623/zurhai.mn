import type { BirthChartInterpretation, HoroscopeData, ShopProduct, UserProfile, ZodiacSign } from './types';

export type ActiveTab = 'horoscope' | 'chart' | 'compatibility' | 'tarot' | 'shop' | 'numerology' | 'admin';

export interface AppUser extends UserProfile {
  id: string;
  createdAt: string;
}

export interface InfoModalState {
  isOpen: boolean;
  title: string;
  type: string;
}

export interface AstraAppState {
  activeTab: ActiveTab;
  chartInterpretation: BirthChartInterpretation | null;
  error: string | null;
  horoscope: HoroscopeData | null;
  isOnboardingOpen: boolean;
  isPremium: boolean;
  isSettingsOpen: boolean;
  isSubModalOpen: boolean;
  loading: boolean;
  purchaseLoading: boolean;
  selectedSign: ZodiacSign | null;
  theme: 'light' | 'dark';
  userProfile: UserProfile | null;
  users: AppUser[];
  infoModal: InfoModalState;
}

export interface AstraAppActions {
  addUser: (profile: UserProfile) => void;
  clearProfile: () => void;
  deleteUser: (id: string) => void;
  handlePurchase: (product: ShopProduct) => Promise<void>;
  loadHoroscope: (sign: ZodiacSign) => Promise<void>;
  retryAstroRequests: () => void;
  saveProfile: (profile: UserProfile) => void;
  selectUser: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setInfoModal: (state: InfoModalState) => void;
  setIsOnboardingOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setSelectedSign: (sign: ZodiacSign | null) => void;
  setSubModalOpen: (open: boolean) => void;
  startProfileFromOnboarding: () => void;
  toggleTheme: () => void;
  upgradeToPremium: () => void;
  updateProfile: (profile: UserProfile) => void;
}
