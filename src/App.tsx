import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Star, Sparkles, Navigation, ChevronRight, User, ShieldCheck, Heart, Zap, ShoppingBag, Hash, Check, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { ZodiacSign, HoroscopeData, UserProfile, ShopProduct, SIGN_NAMES_MN, BirthChartInterpretation } from './types';
import { fetchDailyHoroscope, interpretBirthChart } from './services/geminiService';
import { useAppStore } from './store/useAppStore';
import CelestialBackground from './components/CelestialBackground';
import ZodiacSignGrid from './components/ZodiacSignGrid';
import HoroscopeDisplay from './components/HoroscopeDisplay';
import BirthChartForm from './components/BirthChartForm';
import SubscriptionModal from './components/SubscriptionModal';
import CompatibilityView from './components/CompatibilityView';
import TarotView from './components/TarotView';
import ShopView from './components/ShopView';
import NumerologyView from './components/NumerologyView';
import GeneralInfoModal from './components/GeneralInfoModal';
import OnboardingModal from './components/OnboardingModal';
import SettingsModal from './components/SettingsModal';
import ZodiacWheel from './components/ZodiacWheel';
import QuotaStatus from './components/QuotaStatus';

import Toaster, { Toast } from './components/Toaster';
import { toastEvent, toast } from './lib/toast';

export default function App() {
  const { activeTab, setActiveTab } = useAppStore();
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [horoscopeCache, setHoroscopeCache] = useState<Record<string, HoroscopeData>>({});
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chartInterpretation, setChartInterpretation] = useState<BirthChartInterpretation | null>(null);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean, title: string, type: string }>({
    isOpen: false,
    title: '',
    type: ''
  });

  const addToast = (message: string, type: 'error' | 'success' | 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const unsubscribe = toastEvent.subscribe(addToast);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Robust profile loading
    const initializeApp = () => {
      try {
        const saved = localStorage.getItem('astra_profile');
        if (saved) {
          const profile: UserProfile = JSON.parse(saved);
          if (profile && typeof profile === 'object' && profile.name) {
            // Recover astroData from individual key if missing in profile
            if (!profile.astroData) {
              const savedAstro = localStorage.getItem('astroData');
              if (savedAstro) {
                try {
                  profile.astroData = JSON.parse(savedAstro);
                } catch (e) {
                  console.warn("Could not parse astroData", e);
                }
              }
            }

            setUserProfile(profile);
            if (profile.sunSign) setSelectedSign(profile.sunSign);
            
            if (profile.astroData) {
              setChartInterpretation(profile.astroData);
            } else if (profile.sunSign) {
              generateChart(profile);
            }
          } else {
            throw new Error("Invalid profile structure");
          }
        } else {
          // Check onboarding
          const onboardingShown = localStorage.getItem('astra_onboarding_shown');
          if (!onboardingShown) {
            setIsOnboardingOpen(true);
          }
        }
      } catch (err) {
        console.error("Profile initialization failed:", err);
        // Clear potentially corrupted data
        localStorage.removeItem('astra_profile');
        setIsOnboardingOpen(true);
      }

      try {
        const premiumStatus = localStorage.getItem('astra_premium') === 'true';
        setIsPremium(premiumStatus);

        const savedTheme = localStorage.getItem('astra_theme') as 'light' | 'dark' | null;
        if (savedTheme) {
          setTheme(savedTheme);
          if (savedTheme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      } catch (err) {
        console.warn("Preference loading failed:", err);
        document.documentElement.classList.add('dark');
      }
    };

    initializeApp();

    // Handle Stripe redirect success
    try {
      const query = new URLSearchParams(window.location.search);
      if (query.get('session_id')) {
        setIsPremium(true);
        localStorage.setItem('astra_premium', 'true');
        
        const saved = localStorage.getItem('astra_profile');
        if (saved) {
          const profile: UserProfile = JSON.parse(saved);
          profile.isPremium = true;
          localStorage.setItem('astra_profile', JSON.stringify(profile));
          setUserProfile(profile);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      console.error("Stripe callback handling failed:", err);
    }
  }, []);

  useEffect(() => {
    if (selectedSign) {
      loadHoroscope(selectedSign);
    }
  }, [selectedSign, chartInterpretation]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('astra_theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const loadHoroscope = async (sign: ZodiacSign, isSilent = false) => {
    const cacheKey = `${sign}-${chartInterpretation ? 'personalized' : 'general'}`;
    
    // If we have it in cache, use it immediately
    if (horoscopeCache[cacheKey]) {
      setHoroscope(horoscopeCache[cacheKey]);
      if (!isSilent) return;
    }

    if (!isSilent) {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await fetchDailyHoroscope(sign, chartInterpretation || undefined);
      setHoroscope(data);
      setHoroscopeCache(prev => ({ ...prev, [cacheKey]: data }));
    } catch (e: any) {
      console.error(e);
      if (!isSilent) {
        if (e.message === 'QUOTA_EXCEEDED') {
          setError('QUOTA_EXCEEDED');
        } else {
          toast.error('Зурхай ачаалахад алдаа гарлаа. Та дараа дахин оролдоно уу.');
        }
      }
    } finally {
      if (!isSilent) setLoading(false);
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
          amount: Math.round(product.price * 100)
        })
      });
      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        toast.error('Төлбөрийн сесс үүсгэхэд алдаа гарлаа.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Төлбөрийн системд алдаа гарлаа. Сүлжээгээ шалгана уу.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleRetryQuota = () => {
    setError(null);
    if (selectedSign) loadHoroscope(selectedSign);
    if (userProfile && !chartInterpretation) generateChart(userProfile);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      let targetId = '';
      if (activeTab === 'horoscope') targetId = 'horoscope-content';
      else if (activeTab === 'chart') targetId = userProfile ? 'chart-content' : 'chart-form-section';
      else if (activeTab === 'compatibility') targetId = 'compatibility-content';
      else if (activeTab === 'shop') targetId = 'shop-content';

      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }, 350); // Timeout to allow for AnimatePresence transitions
    
    return () => clearTimeout(timer);
  }, [activeTab, userProfile]);

  const saveProfile = (profile: UserProfile) => {
    const updatedProfile = { ...profile, isPremium };
    setUserProfile(updatedProfile);
    localStorage.setItem('astra_profile', JSON.stringify(updatedProfile));
    setSelectedSign(profile.sunSign);
    generateChart(updatedProfile);
  };

  const generateChart = async (profile: UserProfile) => {
    if (profile.astroData) {
      setChartInterpretation(profile.astroData);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await interpretBirthChart(profile.name, profile.birthDate, profile.birthTime, profile.birthLocation);
      setChartInterpretation(result);
      
      // Update profile with astroData and persist
      const updatedProfile = { ...profile, astroData: result };
      setUserProfile(updatedProfile);
      localStorage.setItem('astra_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('astroData', JSON.stringify(result));
      toast.success('Төрсний зурхай амжилттай үүслээ.');
    } catch (e: any) {
      console.error(e);
      if (e.message === 'QUOTA_EXCEEDED') {
        setError('QUOTA_EXCEEDED');
      } else {
        toast.error('Төрсний зурхай тодорхойлоход алдаа гарлаа.');
      }
    } finally {
      setLoading(false);
    }
  };

  const prefetchHoroscope = (sign: ZodiacSign) => {
    const cacheKey = `${sign}-${chartInterpretation ? 'personalized' : 'general'}`;
    if (sign !== selectedSign && !horoscopeCache[cacheKey]) {
      loadHoroscope(sign, true);
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-slate-200 overflow-x-hidden pb-20">
      <CelestialBackground aria-hidden="true" />
      
      {/* Navigation */}
      <nav role="navigation" aria-label="Үндсэн цэс" className="h-16 px-4 md:px-8 border-b border-white/5 flex items-center justify-between bg-[#08080C]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-4 md:space-x-10">
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-full opacity-80"></div>
            </div>
            <span className="text-lg md:text-xl font-serif font-bold tracking-tight text-white italic">ASTRA<span className="text-indigo-400 font-sans font-light not-italic">AI</span></span>
          </div>
          <div className="hidden lg:flex items-center h-full ml-12">
            <div className="flex bg-white/5 p-1 rounded-full border border-white/5 space-x-1">
              {[
                { id: 'horoscope', label: 'Самбар' },
                { id: 'chart', label: 'Зурхай' }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-2 flex items-center text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-500 rounded-full group ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <span className="relative z-10 transition-transform duration-300 group-active:scale-95">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="header-nav-active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 rounded-full shadow-[0_0_25px_rgba(99,102,241,0.25)] overflow-hidden"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                    >
                      <motion.div 
                        animate={{ 
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.2, 1],
                          x: ['-100%', '100%']
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "linear" 
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                      />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-6">
          <QuotaStatus 
            error={error} 
            isPremium={isPremium} 
            onRetry={handleRetryQuota} 
            onUpgrade={() => setSubModalOpen(true)}
          />
          
          <div className="hidden md:flex items-center space-x-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold">LIVE</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-white flex items-center justify-center"
              title={theme === 'dark' ? 'Гэрэлтэй горим' : 'Харанхуй горим'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 md:gap-3 p-1 pr-1 md:pr-4 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group overflow-hidden"
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-[10px] font-serif border border-white/20 shrink-0">
                {userProfile?.name?.[0] || 'A'}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[80px]">{userProfile?.name || 'Хэрэглэгч'}</p>
                <p className="text-[8px] text-slate-500 uppercase font-mono">{userProfile?.sunSign ? SIGN_NAMES_MN[userProfile.sunSign] : 'Ордгүй'}</p>
              </div>
            </button>
            <button 
              onClick={() => setSubModalOpen(true)}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-astra-gold text-cosmos-black rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shrink-0"
            >
              {isPremium ? 'PREMIUM' : 'VIP'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
        {/* Quota Error Message */}
        <AnimatePresence>
          {error === 'QUOTA_EXCEEDED' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="mb-12 p-8 md:p-12 glass-card border-amber-500/30 bg-amber-500/5 text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1),transparent_70%)]" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-shimmer pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/30 shadow-2xl shadow-amber-500/20">
                  <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                </div>
                
                <h3 className="text-2xl md:text-4xl font-serif text-white mb-6 italic tracking-tight">Сансрын энерги түр саатлаа</h3>
                
                <div className="space-y-4 mb-10">
                  <p className="text-slate-300 max-w-xl mx-auto text-sm md:text-lg leading-relaxed">
                    Үнэгүй хувилбарын өдрийн ашиглалтын хязгаар (Quota) хэтэрсэн байна. Оддын энерги <span className="text-amber-500 font-bold block md:inline mt-2 md:mt-0 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">маргааш өглөө 09:00 цагт</span> бүрэн шинэчлэгдэх болно.
                  </p>
                  
                  {/* Countdown Timer */}
                  <div className="flex items-center justify-center gap-4 text-xs font-mono">
                    <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10 min-w-[70px]">
                      <span className="text-amber-500 text-lg font-bold">{Math.max(0, 23 - new Date().getHours() + (new Date().getHours() < 9 ? -15 : 9))}</span>
                      <span className="text-slate-500 uppercase tracking-tighter">Цаг</span>
                    </div>
                    <div className="text-slate-700 text-xl font-bold">:</div>
                    <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10 min-w-[70px]">
                      <span className="text-amber-500 text-lg font-bold">{59 - new Date().getMinutes()}</span>
                      <span className="text-slate-500 uppercase tracking-tighter">Минут</span>
                    </div>
                  </div>

                  {!isPremium && (
                    <p className="text-indigo-400 text-xs md:text-sm font-medium uppercase tracking-[0.1em] pt-4">
                      VIP гишүүн болсноор хязгааргүй ашиглах боломжтой.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={handleRetryQuota}
                    className="w-full sm:w-auto px-10 py-5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20 flex items-center justify-center gap-3 group-hover:scale-105 active:scale-95"
                  >
                    <RefreshCw size={18} />
                    Одоо Дахин оролдох
                  </button>
                  
                  {!isPremium && (
                    <button 
                      onClick={() => setSubModalOpen(true)}
                      className="w-full sm:w-auto px-10 py-5 bg-astra-gold hover:bg-yellow-400 text-cosmos-black rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                      <User size={18} />
                      VIP багц аваарай
                    </button>
                  )}

                  <button 
                    onClick={() => setError(null)}
                    className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border border-white/10"
                  >
                    Хаах
                  </button>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] uppercase tracking-widest bg-slate-950/40 px-4 py-2 rounded-full border border-white/5">
                    <AlertCircle size={14} className="text-amber-500/50" />
                    <span>Reset: 24h Window</span>
                  </div>
                  <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-mono">
                    Хэрэв та өөрийн API түлхүүрийг ашиглаж байгаа бол тохиргоогоо шалгана уу.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mb-4 md:mb-6"
          >
            <Sparkles size={12} />
            Одод танд зориулагдсан байна
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl sm:text-5xl md:text-8xl font-serif font-bold mb-4 md:mb-6 sleek-glow tracking-tighter text-center text-white"
          >
            Таны <span className="text-indigo-400">Тэнгэрийн</span> Хөтөч
          </motion.h2>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-sans font-light leading-relaxed text-center px-4">
            AI-д суурилсан хувийн зурхайгаар сансрын урсгалыг чиглүүл. 
            Таны хувь тавилан, аз болон ирээдүйн талаарх гүн гүнзгий ойлголт.
          </p>
        </div>

      {/* Dynamic Tabs Indicator - Better Mobile Selection */}
      <div className="sticky top-[65px] z-40 bg-[#08080C]/80 backdrop-blur-md py-4 -mx-4 px-4 md:mx-0 md:bg-transparent md:static">
        <div className="flex justify-center">
          <div 
            role="tablist"
            aria-label="Зурхайн хэсгүүд"
            className="bg-slate-900/50 p-1 rounded-2xl border border-white/5 flex gap-1 overflow-x-auto no-scrollbar max-w-full snap-x"
          >
            <TabButton 
              active={activeTab === 'horoscope'} 
              onClick={() => setActiveTab('horoscope')}
              label="Өдрийн зурхай"
              icon={<Star size={16} />}
            />
            <TabButton 
              active={activeTab === 'chart'} 
              onClick={() => setActiveTab('chart')}
              label="Ордын зураглал"
              icon={<Navigation size={16} />}
            />
            <TabButton 
              active={activeTab === 'numerology'} 
              onClick={() => setActiveTab('numerology')}
              label="Тоон зурхай"
              icon={<Hash size={16} />}
            />
            <TabButton 
              active={activeTab === 'compatibility'} 
              onClick={() => setActiveTab('compatibility')}
              label="Тохироо"
              icon={<Heart size={16} />}
              isLocked={!isPremium}
            />
            <TabButton 
              active={activeTab === 'tarot'} 
              onClick={() => setActiveTab('tarot')}
              label="Тарот"
              icon={<Zap size={16} />}
              isLocked={!isPremium}
            />
            <TabButton 
              active={activeTab === 'shop'} 
              onClick={() => setActiveTab('shop')}
              label="Дэлгүүр"
              icon={<ShoppingBag size={16} />}
            />
          </div>
        </div>
      </div>

      <section className="min-h-[500px]">
          {activeTab === 'horoscope' && (
            <div className="space-y-12">
              <div className="text-center">
                <h3 className="text-xs uppercase tracking-[0.5em] text-slate-500 mb-8">Ивээл ордоо сонгоно уу</h3>
                <ZodiacSignGrid onSelect={setSelectedSign} onHover={prefetchHoroscope} selectedSign={selectedSign} />
              </div>
              <HoroscopeDisplay data={horoscope} isLoading={loading} isPersonalized={!!chartInterpretation} chartData={chartInterpretation || undefined} />
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="space-y-12">
              {!userProfile ? (
                <div className="max-w-4xl mx-auto space-y-12">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 px-8 glass-card border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_70%)] pointer-events-none" />
                    <Sparkles className="w-16 h-16 text-astra-gold mx-auto mb-6 animate-pulse" />
                    <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 italic tracking-tight">Сансрын зураглалаа нээх</h2>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed mb-8">
                      Таны төрсөн цаг, байршил ододтой хэрхэн холбогдож буйг олж мэднэ үү. Өөрийн мэдээллийг оруулснаар 
                      <span className="text-indigo-400 font-bold"> хувь тавилангийн нарийн оношлогоо</span> болон 
                      <span className="text-astra-gold font-bold"> хувийн өдөр тутмын зурхайг</span> идэвхжүүлэх боломжтой.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Төрсөн цагийн нөлөө
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Гараг эрхсийн байрлал
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-500" /> Мандах ордын тайлал
                      </div>
                    </div>
                  </motion.div>
                  <div id="chart-form-section">
                    <BirthChartForm onSave={saveProfile} />
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <div className="flex justify-between items-center mb-8 px-4">
                    <h3 className="text-xl font-light text-indigo-300">Хувь тавилангаа нээх нь, {userProfile.name}</h3>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('astra_profile');
                        setUserProfile(null);
                        setChartInterpretation(null);
                      }}
                      className="text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                    >
                      Профайл шинэчлэх
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="glass-card p-20 flex flex-col items-center justify-center">
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }}>
                        <Moon className="w-12 h-12 text-indigo-500/50" />
                      </motion.div>
                      <p className="mt-8 text-slate-400 italic">Тэнгэрийн зураглалыг тайлж байна...</p>
                    </div>
                  ) : chartInterpretation && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-12"
                    >
                      {/* Visual Chart Wheel */}
                      <div className="py-12 glass-card bg-indigo-950/20 border-white/5 relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/5 blur-[100px] pointer-events-none" />
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-center text-indigo-400 mb-12 font-mono font-bold">Таны Сансрын Зураглал</h4>
                        <ZodiacWheel 
                          sunSign={chartInterpretation.sun.sign} 
                          moonSign={chartInterpretation.moon.sign} 
                          risingSign={chartInterpretation.rising?.sign} 
                        />
                      </div>

                      {/* Detailed Breakdown Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ChartSignCard 
                          title="Наран орд" 
                          sign={chartInterpretation.sun.sign} 
                          meaning={chartInterpretation.sun.meaning}
                          icon={<Star size={24} />}
                          color="from-amber-400 to-orange-600"
                        />
                        <ChartSignCard 
                          title="Саран орд" 
                          sign={chartInterpretation.moon.sign} 
                          meaning={chartInterpretation.moon.meaning}
                          icon={<Moon size={24} />}
                          color="from-indigo-400 to-blue-600"
                        />
                        {chartInterpretation.rising && (
                          <ChartSignCard 
                            title="Мандах орд" 
                            sign={chartInterpretation.rising.sign} 
                            meaning={chartInterpretation.rising.meaning}
                            icon={<Navigation size={24} />}
                            color="from-emerald-400 to-teal-600"
                          />
                        )}
                      </div>

                      <div className="glass-card p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-slate-900/40">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl"></div>
                        <div className="prose prose-invert max-w-none relative z-10">
                          <h4 className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-6 font-mono font-bold">Ерөнхий Зураглал</h4>
                          <div className="whitespace-pre-wrap leading-[1.8] font-serif text-lg text-slate-300 first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-indigo-400">
                            {chartInterpretation.summary}
                          </div>
                        </div>

                        {!isPremium && (
                          <div className="mt-12 p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                              <h4 className="text-indigo-400 font-bold mb-1">Амьдралын Гүн Зураглал Түгжигдсэн</h4>
                              <p className="text-xs text-slate-500">Ажил мэргэжил болон харилцааны нууцыг нээхийн тулд сайжруулна уу.</p>
                            </div>
                            <button 
                              onClick={() => setSubModalOpen(true)}
                              className="bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-indigo-500 transition-transform active:scale-95 uppercase tracking-wider"
                            >
                              БҮХ НУУЦЫГ НЭЭХ
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'compatibility' && (
            isPremium ? <CompatibilityView userSign={userProfile?.sunSign} /> : (
              <div className="text-center py-24 glass-card border-white/5 bg-slate-900/40 max-w-2xl mx-auto">
                 <ShieldCheck size={48} className="mx-auto text-indigo-500 mb-6 opacity-40 hover:opacity-100 transition-opacity" />
                 <h3 className="text-2xl font-light text-white mb-4 italic">Премиум Онцлог</h3>
                 <p className="text-slate-500 mb-8 max-w-md mx-auto">Ордуудын тохироог нарийвчлан үзэж, харилцааны нууцыг нээхийн тулд сайжруулна уу.</p>
                 <button 
                  onClick={() => setSubModalOpen(true)}
                  className="bg-indigo-600 px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                 >
                   ОДОО САЙЖРУУЛАХ
                 </button>
              </div>
            )
          )}

          {activeTab === 'tarot' && (
            isPremium ? <TarotView /> : (
              <div className="text-center py-24 glass-card border-white/5 bg-slate-900/40 max-w-2xl mx-auto">
                 <Zap size={48} className="mx-auto text-indigo-500 mb-6 opacity-40 hover:opacity-100 transition-opacity" />
                 <h3 className="text-2xl font-light text-white mb-4 italic">Премиум Онцлог</h3>
                 <p className="text-slate-500 mb-8 max-w-md mx-auto">Өдөр тутмын тарот зөвлөгөөг идэвхжүүлэхийн тулд сайжруулна уу.</p>
                 <button 
                  onClick={() => setSubModalOpen(true)}
                  className="bg-indigo-600 px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                 >
                   ОДОО САЙЖРУУЛАХ
                 </button>
              </div>
            )
          )}

          {activeTab === 'shop' && (
            <ShopView onPurchase={handlePurchase} isLoading={purchaseLoading} />
          )}

          {activeTab === 'numerology' && (
            <NumerologyView userProfile={userProfile} />
          )}
        </section>

        {/* Feature Cards / CTA */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Sparkles className="text-astra-gold" />}
            title="Өдөр тутмын Дамжих Хөдөлгөөн"
            desc="Манай тэнгэрийн хөдөлгүүр 15 минут тутамд таны байршилд үндэслэн гариг эрхсийн нөлөөг тооцдог."
            onClick={() => setInfoModal({ isOpen: true, title: 'Өдөр тутмын Дамжих Хөдөлгөөн', type: 'astro' })}
          />
          <FeatureCard 
            icon={<Moon className="text-astra-blue" />}
            title="Сарны Мөчлөг"
            desc="Шинэ болон Тэргэл сарны энергийг ашиглан хүсэл зоригоо тодорхойлж, хуучин ачаанаас сал."
            onClick={() => setInfoModal({ isOpen: true, title: 'Сарны Мөчлөг', type: 'phi' })}
          />
          <FeatureCard 
            icon={<Star className="text-astra-purple" />}
            title="AI Зөн Совин"
            desc="Тооноос гадна Astra нь хүний ​​сэтгэл санааны зөн совингийн удирдамжийг өгөхийн тулд хөгжүүлсэн алгоритм ашигладаг."
            onClick={() => setInfoModal({ isOpen: true, title: 'AI Зөн Совин', type: 'help' })}
          />
        </section>
      </main>

      {/* Footer */}
      <footer role="contentinfo" className="mt-40 border-t border-white/5 py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="max-w-xs cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-astra-gold rounded-full flex items-center justify-center">
                <Moon className="text-cosmos-black fill-cosmos-black" size={16} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white italic">ASTRA<span className="text-indigo-400 font-sans font-light not-italic">AI</span></h2>
            </div>
            <p className="text-xs text-white/30 leading-relaxed uppercase tracking-wider">
              Тэнгэрийн одод, эртний мэргэн ухааныг зохиомлоор дамжуулан дижитал эрин зуунд авчирна.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-20">
            <FooterLinks 
              title="Үйлчилгээ" 
              links={[
                { name: 'Өдрийн зурхай', id: 'horoscope' },
                { name: 'Төрсөн орд', id: 'chart' },
                { name: 'Тохироо', id: 'compatibility' },
                { name: 'Зөн билэг', id: 'tarot' }
              ]} 
              onLinkClick={(id) => {
                setActiveTab(id as any);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <FooterLinks 
              title="Ертөнц" 
              links={[
                { name: 'Одон орон', id: 'astro' },
                { name: 'Философи', id: 'phi' },
                { name: 'Тусламж', id: 'help' },
                { name: 'Хууль эрх зүй', id: 'legal' }
              ]} 
              onLinkClick={(id) => {
                const link = [
                  { name: 'Одон орон', id: 'astro' },
                  { name: 'Философи', id: 'phi' },
                  { name: 'Тусламж', id: 'help' },
                  { name: 'Хууль эрх зүй', id: 'legal' }
                ].find(l => l.id === id);
                if (link) {
                  setInfoModal({ isOpen: true, title: link.name, type: id });
                }
              }}
            />
          </div>

          <div className="text-center md:text-right">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-4">Тэнгэрийн Үйл Явдалд Бүртгүүлэх</p>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert('Бүртгэл амжилттай! Та ододтой холбогдлоо.');
                (e.target as any).reset();
              }}
              className="flex gap-2"
            >
              <input 
                type="email" 
                required
                placeholder="Таны имэйл" 
                className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-astra-gold/30" 
              />
              <button 
                type="submit"
                className="bg-white text-black rounded-full p-2 hover:bg-astra-gold transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </form>
          </div>
        </div>
        <div className="text-center mt-20 text-[10px] text-white/10 uppercase tracking-widest">
           &copy; {new Date().getFullYear()} Astra Labs. Одод бичигдсэн хувь тавилан.
        </div>
      </footer>

      <SubscriptionModal 
        isOpen={isSubModalOpen} 
        onClose={() => setSubModalOpen(false)} 
        onUpgrade={() => {
          setIsPremium(true);
          localStorage.setItem('astra_premium', 'true');
          setSubModalOpen(false);
        }}
      />

      <GeneralInfoModal 
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
        title={infoModal.title}
        type={infoModal.type}
      />

      <OnboardingModal 
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
          localStorage.setItem('astra_onboarding_shown', 'true');
        }}
        onStartProfile={() => {
          setIsOnboardingOpen(false);
          localStorage.setItem('astra_onboarding_shown', 'true');
          setActiveTab('chart');
          // Smooth scroll to form
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(profile) => {
          // Keep astroData when updating other profile fields if it matches the current details
          const finalProfile = { ...profile };
          if (!finalProfile.astroData && chartInterpretation) {
            finalProfile.astroData = chartInterpretation;
          }

          setUserProfile(finalProfile);
          localStorage.setItem('astra_profile', JSON.stringify(finalProfile));
          
          if (finalProfile.astroData) {
            localStorage.setItem('astroData', JSON.stringify(finalProfile.astroData));
            setChartInterpretation(finalProfile.astroData);
          }
          
          if (finalProfile.sunSign) setSelectedSign(finalProfile.sunSign);
          toast.success('Astro Data has been saved');
        }}
        isPremium={isPremium}
        error={error}
        onRetry={handleRetryQuota}
      />

      <Toaster toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function ChartSignCard({ title, sign, meaning, icon, color }: { title: string, sign: string, meaning: string, icon: React.ReactNode, color: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="glass-card p-6 border-white/5 bg-slate-900/50 flex flex-col items-center text-center group hover:border-indigo-500/30 transition-all duration-500 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-mono font-bold">{title}</div>
      <h3 className="text-2xl font-serif text-white mb-4 italic">{sign}</h3>
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
        {meaning}
      </p>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-50 bottom-full left-0 right-0 mb-4 p-4 glass-card bg-slate-900 border-indigo-500/30 shadow-2xl pointer-events-none"
          >
            <p className="text-xs text-slate-200 leading-relaxed text-left">
              {meaning}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-indigo-500/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, label, icon, isLocked }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode, isLocked?: boolean }) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      aria-label={`${label}${isLocked ? ' (Premium)' : ''}`}
      className={`relative px-5 sm:px-10 py-4 rounded-2xl flex items-center gap-2 sm:gap-3 transition-all duration-700 whitespace-nowrap focus:outline-none snap-center group ${
        active ? 'text-white' : 'text-slate-500 hover:text-slate-200'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="tab-active-pill-bg"
          className="absolute inset-0 bg-white/[0.05] backdrop-blur-[12px] rounded-2xl border border-white/10 shadow-[inset_0_0_25px_rgba(255,255,255,0.03),0_10px_30px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        >
          <motion.div 
            animate={{ 
              x: ['-100%', '200%'],
              opacity: [0, 0.5, 0]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
          />
        </motion.div>
      )}
      
      {active && (
        <motion.div 
          layoutId="tab-active-glow-aura"
          className="absolute inset-0 bg-indigo-500/15 blur-[35px] rounded-full scale-100 opacity-60"
          transition={{ type: "spring", bounce: 0, duration: 1 }}
        />
      )}

      {active && (
        <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden rounded-2xl pointer-events-none">
          <motion.div 
            layoutId="tab-active-side-lines"
            className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_rgba(129,140,248,0.8)]"
            transition={{ type: "spring", bounce: 0.2, duration: 0.7 }}
          />
          <motion.div 
            layoutId="tab-active-top-glow"
            className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
            transition={{ type: "spring", bounce: 0.2, duration: 0.7 }}
          />
        </div>
      )}

      <span className={`relative z-10 transition-all duration-700 ${active ? 'scale-115 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.7)]' : 'scale-100 group-hover:scale-110 group-hover:text-slate-100'}`}>
        {icon}
      </span>
      <span className={`relative z-10 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${active ? 'opacity-100 text-white translate-y-0' : 'opacity-40 group-hover:opacity-100 text-slate-400'}`}>
        {label}
      </span>
      {isLocked && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative z-10 text-astra-gold ml-1"
        >
          <Zap size={10} />
        </motion.div>
      )}
    </button>
  );
}

function FeatureCard({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="glass-card p-10 group bg-slate-900/30 border-white/5 cursor-pointer"
    >
      <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <div className="text-indigo-400">{icon}</div>
      </div>
      <h3 className="text-white font-medium mb-4 tracking-wide uppercase text-[10px]">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FooterLinks({ title, links, onLinkClick }: { title: string, links: { name: string, id: string }[], onLinkClick: (id: string) => void }) {
  return (
    <div>
      <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-600 mb-6">{title}</h4>
      <ul className="space-y-3">
        {links.map(link => (
          <li key={link.id}>
            <button 
              onClick={() => onLinkClick(link.id)}
              className="text-xs text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest text-left"
            >
              {link.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
