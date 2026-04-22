import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, Star, Sparkles, Navigation, ChevronRight, User, ShieldCheck, Heart, Zap, ShoppingBag, Hash } from 'lucide-react';
import { ZodiacSign, HoroscopeData, UserProfile, ShopProduct, SIGN_NAMES_MN, BirthChartInterpretation } from './types';
import { fetchDailyHoroscope, interpretBirthChart } from './services/geminiService';
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

export default function App() {
  const [selectedSign, setSelectedSign] = useState<ZodiacSign | null>(null);
  const [horoscope, setHoroscope] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chartInterpretation, setChartInterpretation] = useState<BirthChartInterpretation | null>(null);
  const [isSubModalOpen, setSubModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'horoscope' | 'chart' | 'compatibility' | 'tarot' | 'shop' | 'numerology'>('horoscope');
  const [isPremium, setIsPremium] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean, title: string, type: string }>({
    isOpen: false,
    title: '',
    type: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('astra_profile');
    if (saved) {
      const profile = JSON.parse(saved);
      setUserProfile(profile);
      setSelectedSign(profile.sunSign);
      generateChart(profile);
    } else {
      // Check if onboarding was already shown
      const onboardingShown = localStorage.getItem('astra_onboarding_shown');
      if (!onboardingShown) {
        setIsOnboardingOpen(true);
      }
    }
    
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

    // Handle Stripe redirect success
    const query = new URLSearchParams(window.location.search);
    if (query.get('session_id')) {
      setIsPremium(true);
      localStorage.setItem('astra_premium', 'true');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (selectedSign) {
      loadHoroscope(selectedSign);
    }
  }, [selectedSign]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('astra_theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const loadHoroscope = async (sign: ZodiacSign) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyHoroscope(sign, chartInterpretation || undefined);
      setHoroscope(data);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'QUOTA_EXCEEDED') {
        setError('QUOTA_EXCEEDED');
      }
    } finally {
      setLoading(false);
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
      }
    } catch (error) {
      console.error(error);
      alert('Төлбөрийн системд алдаа гарлаа.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const saveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('astra_profile', JSON.stringify(profile));
    setSelectedSign(profile.sunSign);
    generateChart(profile);
  };

  const generateChart = async (profile: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const result = await interpretBirthChart(profile.name, profile.birthDate, profile.birthTime, profile.birthLocation);
      setChartInterpretation(result);
    } catch (e: any) {
      console.error(e);
      if (e.message === 'QUOTA_EXCEEDED') {
        setError('QUOTA_EXCEEDED');
      }
    } finally {
      setLoading(false);
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
          <div className="hidden lg:flex space-x-6 text-sm font-medium text-slate-400">
            <button 
              onClick={() => setActiveTab('horoscope')}
              className={`transition-colors py-5 ${activeTab === 'horoscope' ? 'text-white border-b-2 border-indigo-500' : 'hover:text-white'}`}
            >
              Хянах самбар
            </button>
            <button 
              onClick={() => setActiveTab('chart')}
              className={`transition-colors py-5 ${activeTab === 'chart' ? 'text-white border-b-2 border-indigo-500' : 'hover:text-white'}`}
            >
              Зурхай
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-6">
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-12 p-8 glass-card border-indigo-500/30 bg-indigo-500/5 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-shimmer pointer-events-none" />
              <div className="relative z-10">
                <Sparkles className="w-12 h-12 text-astra-gold mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-serif text-white mb-2 italic">Сансрын энерги цэнэг авч байна</h3>
                <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed mb-6">
                  Өнөөдрийн тэнгэрийн мэдээллийн урсгал дээд цэгтээ хүрлээ. Оддын энерги дахин боловсруулагдах хүртэл хэсэг хүлээгээд дахин оролдоно уу.
                </p>
                <button 
                  onClick={() => {
                    setError(null);
                    if (selectedSign) loadHoroscope(selectedSign);
                    if (userProfile) generateChart(userProfile);
                  }}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                >
                  Дахин оролдох
                </button>
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
                <ZodiacSignGrid onSelect={setSelectedSign} selectedSign={selectedSign} />
              </div>
              <HoroscopeDisplay data={horoscope} isLoading={loading} isPersonalized={!!chartInterpretation} />
            </div>
          )}

          {activeTab === 'chart' && (
            <div className="space-y-12">
              {!userProfile ? (
                <BirthChartForm onSave={saveProfile} />
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
                      className="space-y-8"
                    >
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
            isPremium ? <CompatibilityView /> : (
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
          setUserProfile(profile);
          localStorage.setItem('astra_user_profile', JSON.stringify(profile));
          if (profile.sunSign) setSelectedSign(profile.sunSign);
        }}
      />
    </div>
  );
}

function ChartSignCard({ title, sign, meaning, icon, color }: { title: string, sign: string, meaning: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="glass-card p-6 border-white/5 bg-slate-900/50 flex flex-col items-center text-center group hover:border-indigo-500/30 transition-all duration-500">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-mono font-bold">{title}</div>
      <h3 className="text-2xl font-serif text-white mb-4 italic">{sign}</h3>
      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
        {meaning}
      </p>
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
      className={`relative px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center gap-2 sm:gap-3 transition-all duration-500 overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500/50 snap-center ${
        active ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="tab-active"
          className="absolute inset-0 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
        />
      )}
      <span className={`relative z-10 transition-transform duration-500 ${active ? 'scale-110' : 'scale-100 opacity-60'}`}>
        {icon}
      </span>
      <span className="relative z-10 text-[10px] md:text-xs font-bold uppercase tracking-widest">{label}</span>
      {isLocked && <Zap size={10} className="relative z-10 text-astra-gold ml-1 animate-pulse" />}
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
