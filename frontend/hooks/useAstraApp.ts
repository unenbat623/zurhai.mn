import { useEffect, useState } from 'react';
import type { BirthChartInterpretation, HoroscopeData, ShopProduct, UserProfile, ZodiacSign } from '../types';
import type { ActiveTab, AppUser, InfoModalState } from '../frontendTypes';

const PROFILE_KEY = 'astra_profile';
const USERS_KEY = 'astra_users';
const PREMIUM_KEY = 'astra_premium';
const THEME_KEY = 'astra_theme';
const ONBOARDING_KEY = 'astra_onboarding_shown';
const ACTIVE_TABS: ActiveTab[] = ['horoscope', 'chart', 'numerology', 'compatibility', 'tarot', 'shop', 'admin'];

export function useAstraApp() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chartInterpretation, setChartInterpretation] = useState<BirthChartInterpretation | null>(null);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('horoscope');
  const [isPremium, setIsPremium] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [users, setUsers] = useState<AppUser[]>([]);
  const [infoModal, setInfoModal] = useState<InfoModalState>({ isOpen: false, title: '', type: '' });

  useEffect(() => {
    const savedUsers = readUsers();
    const saved = localStorage.getItem(PROFILE_KEY);
    setUsers(savedUsers);

    if (saved) {
      const profile = JSON.parse(saved) as UserProfile;
      setUserProfile(profile);
      setSelectedSign(profile.sunSign);
      void generateChart(profile);
    }

    setIsPremium(localStorage.getItem(PREMIUM_KEY) === 'true');
    applyTheme((localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null) || 'dark');

    const query = new URLSearchParams(window.location.search);
    const tab = query.get('tab') as ActiveTab | null;
    const adminAccess = query.get('admin') === '1' || tab === 'admin';
    if (adminAccess) {
      setActiveTab('admin');
    } else if (tab && ACTIVE_TABS.includes(tab)) {
      setActiveTab(tab);
    }

    if (query.get('session_id')) {
      setIsPremium(true);
      localStorage.setItem(PREMIUM_KEY, 'true');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (selectedSign) void loadHoroscope(selectedSign);
  }, [selectedSign]);

  const applyTheme = (nextTheme: 'light' | 'dark') => {
    setTheme(nextTheme);
    document.documentElement.classList.toggle('light', nextTheme === 'light');
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  const loadHoroscope = async (sign: ZodiacSign) => {
    setLoading(true);
    setError(null);
    try {
      const { fetchDailyHoroscope } = await import('../services/geminiService');
      setHoroscope(await fetchDailyHoroscope(sign, chartInterpretation || undefined));
    } catch (e: any) {
      console.error(e);
      if (e.message === 'QUOTA_EXCEEDED') setError('QUOTA_EXCEEDED');
    } finally {
      setLoading(false);
    }
  };

  const generateChart = async (profile: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const { interpretBirthChart } = await import('../services/geminiService');
      const result = await interpretBirthChart(profile.name, profile.birthDate, profile.birthTime, profile.birthLocation);
      setChartInterpretation(result);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'QUOTA_EXCEEDED') setError('QUOTA_EXCEEDED');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = (profile: UserProfile) => {
    const nextUser: AppUser = {
      ...profile,
      id: makeUserId(profile),
      createdAt: new Date().toISOString(),
    };
    const nextUsers = upsertUser(readUsers(), nextUser);
    persistUsers(nextUsers);
    setUsers(nextUsers);
    setUserProfile(profile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSelectedSign(profile.sunSign);
    void generateChart(profile);
  };

  const updateProfile = (profile: UserProfile) => {
    const active = users.find(user => isSameProfile(user, userProfile));
    if (active) {
      const nextUsers = users.map(user => (user.id === active.id ? { ...user, ...profile } : user));
      persistUsers(nextUsers);
      setUsers(nextUsers);
    }
    setUserProfile(profile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    if (profile.sunSign) setSelectedSign(profile.sunSign);
  };

  const clearProfile = () => {
    localStorage.removeItem(PROFILE_KEY);
    setUserProfile(null);
    setChartInterpretation(null);
  };

  const addUser = (profile: UserProfile) => {
    const nextUser: AppUser = {
      ...profile,
      id: makeUserId(profile),
      createdAt: new Date().toISOString(),
    };
    const nextUsers = upsertUser(users, nextUser);
    persistUsers(nextUsers);
    setUsers(nextUsers);
    setUserProfile(profile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSelectedSign(profile.sunSign);
    setActiveTab('chart');
    void generateChart(profile);
  };

  const selectUser = (id: string) => {
    const user = users.find(item => item.id === id);
    if (!user) return;
    const profile = stripUserMeta(user);
    setUserProfile(profile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSelectedSign(profile.sunSign);
    setActiveTab('chart');
    void generateChart(profile);
  };

  const deleteUser = (id: string) => {
    const nextUsers = users.filter(user => user.id !== id);
    persistUsers(nextUsers);
    setUsers(nextUsers);
    const deletingActive = users.some(user => user.id === id && isSameProfile(user, userProfile));
    if (deletingActive) {
      localStorage.removeItem(PROFILE_KEY);
      setUserProfile(null);
      setChartInterpretation(null);
      setSelectedSign(null);
    }
  };

  const handlePurchase = async (product: ShopProduct) => {
    setPurchaseLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          amount: Math.round(product.price * 100),
        }),
      });
      const session = await response.json();
      if (session.url) window.location.href = session.url;
      else alert('Худалдан авалт амжилттай бүртгэгдлээ.');
    } catch (err) {
      console.error(err);
      alert('Худалдан авалт local горимоор амжилттай бүртгэгдлээ.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const retryAstroRequests = () => {
    setError(null);
    if (selectedSign) void loadHoroscope(selectedSign);
    if (userProfile) void generateChart(userProfile);
  };

  const upgradeToPremium = () => {
    setIsPremium(true);
    localStorage.setItem(PREMIUM_KEY, 'true');
    setSubModalOpen(false);
  };

  const startProfileFromOnboarding = () => {
    setIsOnboardingOpen(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setActiveTab('chart');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return {
    state: {
      activeTab,
      chartInterpretation,
      error,
      horoscope,
      isOnboardingOpen,
      isPremium,
      isSettingsOpen,
      isSubModalOpen,
      loading,
      purchaseLoading,
      selectedSign,
      theme,
      userProfile,
      users,
      infoModal,
    },
    actions: {
      addUser,
      clearProfile,
      deleteUser,
      handlePurchase,
      loadHoroscope,
      retryAstroRequests,
      saveProfile,
      selectUser,
      setActiveTab,
      setInfoModal,
      setIsOnboardingOpen,
      setIsSettingsOpen,
      setSelectedSign,
      setSubModalOpen,
      startProfileFromOnboarding,
      toggleTheme,
      upgradeToPremium,
      updateProfile,
    },
  };
}

function readUsers() {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as AppUser[]) : [];
  } catch {
    return [];
  }
}

function persistUsers(users: AppUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function makeUserId(profile: UserProfile) {
  return `${profile.name.trim().toLowerCase()}-${profile.birthDate}-${profile.sunSign}`.replace(/[^a-z0-9-]/g, '-');
}

function upsertUser(users: AppUser[], user: AppUser) {
  const exists = users.some(item => item.id === user.id);
  return exists ? users.map(item => (item.id === user.id ? { ...item, ...user, createdAt: item.createdAt } : item)) : [user, ...users];
}

function stripUserMeta(user: AppUser): UserProfile {
  const { id: _id, createdAt: _createdAt, ...profile } = user;
  return profile;
}

function isSameProfile(user: AppUser, profile: UserProfile | null) {
  return !!profile && user.name === profile.name && user.birthDate === profile.birthDate && user.sunSign === profile.sunSign;
}
