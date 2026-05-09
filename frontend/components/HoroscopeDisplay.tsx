
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HoroscopeData, SIGN_NAMES_MN, BirthChartInterpretation } from '../types';
import { Sparkles, Heart, Briefcase, Activity, Landmark, Moon, Sun, Star, Navigation, User, Share2, Copy, Check, Facebook, Twitter, Link } from 'lucide-react';
import { toast } from '../lib/toast';

const MONGOLIAN_COLOR_MAP: Record<string, string> = {
  'Улаан': '#ef4444',
  'Цэнхэр': '#3b82f6',
  'Ногоон': '#22c55e',
  'Шар': '#eab308',
  'Ягаан': '#ec4899',
  'Нийлэг': '#a855f7',
  'Шаргал': '#f59e0b',
  'Хүрэн': '#92400e',
  'Цагаан': '#f8fafc',
  'Хар': '#1e293b',
  'Улбар шар': '#f97316',
  'Улбар': '#fb923c',
  'Алтан': '#fbbf24',
  'Мөнгөн': '#cbd5e1',
  'Хөх': '#1d4ed8',
  'Саарал': '#94a3b8',
  'Тэнгэрийн цэнхэр': '#0ea5e9',
  'Тэнгэрийн хөх': '#38bdf8',
  'Гүн хөх': '#1e3a8a',
  'Цайвар ногоон': '#4ade80',
  'Оюу': '#06b6d4',
  'Нил ягаан': '#8b5cf6',
  'Хүрэн улаан': '#991b1b',
  'Маргад': '#10b981',
  'Тэнгэрлэг': '#7dd3fc',
  'Элсэн': '#fde68a',
  'Наран': '#fbbf24',
  'Сарны': '#e2e8f0',
  'Сансрын': '#4f46e5',
  'Тоорын': '#ff9a8b',
  'Гаа': '#98ff98',
  'Лаванда': '#e6e6fa',
  'Шүрэн': '#ff7f50',
  'Бадмаараг': '#e0115f',
  'Гилбэр': '#008080',
  'Хув': '#ffbf00',
  'Индиго': '#4b0082',
};

const DEFAULT_ASTRA_COLOR = '#6366f1';

const getColorHex = (colorString?: string) => {
  if (!colorString) return DEFAULT_ASTRA_COLOR;
  if (MONGOLIAN_COLOR_MAP[colorString]) return MONGOLIAN_COLOR_MAP[colorString];
  if (colorString.startsWith('#')) return colorString;
  return DEFAULT_ASTRA_COLOR;
};

interface Props {
  data: HoroscopeData | null;
  isLoading: boolean;
  isPersonalized?: boolean;
  chartData?: BirthChartInterpretation;
}

function AstroBadge({ icon, label, sign }: { icon: React.ReactNode, label: string, sign: string }) {
  return (
    <div className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-tighter text-slate-500 font-bold">
        {icon}
        {label}
      </div>
      <div className="text-[10px] text-white font-serif italic">{sign}</div>
    </div>
  );
}

export default function HoroscopeDisplay({ data, isLoading, isPersonalized, chartData }: Props) {
  const [copied, setCopied] = useState(false);

  const getDynamicStyle = () => {
    const colorHex = getColorHex(data?.color);
    return {
      background: `linear-gradient(165deg, ${colorHex}22 0%, #0f172a 40%, #020617 100%)`,
      borderColor: `${colorHex}44`,
      boxShadow: `0 20px 50px -12px ${colorHex}15`
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-indigo-400 opacity-50" />
        </motion.div>
        <p className="mt-4 text-white/60 font-serif italic">Тэнгэрийн зурлагыг уншиж байна...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card border-dashed border-white/10 min-h-[400px] max-w-2xl mx-auto">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="text-center"
        >
          <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-6" />
          <h3 className="text-xl font-serif text-slate-400 mb-2 italic">Зурхай бэлэн биш байна</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
            Та дээрх жагсаалтаас өөрийн ордоо сонгож өнөөдрийн тэнгэрийн зурлагаа харна уу.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleShare = async () => {
    const text = `${SIGN_NAMES_MN[data.sign] || data.sign} ордын өнөөдрийн (${data.date}) зурхай: "${data.dailyMessage}" #Astra #Zodiac`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Astra - ${SIGN_NAMES_MN[data.sign] || data.sign} Зурхай`,
          text: text,
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n\n${url}`);
        setCopied(true);
        toast.success('Холбоосыг санах ойд хууллаа.');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy!', err);
      }
    }
  };

  const shareToSocial = (platform: 'facebook' | 'twitter') => {
    const text = `${SIGN_NAMES_MN[data.sign] || data.sign} ордын өнөөдрийн (${data.date}) зурхай: "${data.dailyMessage}" #Astra #Zodiac`;
    const url = window.location.href;
    let shareUrl = '';

    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={data.sign}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass-card p-4 sm:p-8 max-w-2xl mx-auto overflow-hidden transition-colors duration-500"
        style={getDynamicStyle()}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 blur-3xl"></div>
        
        <div className="flex justify-between items-start relative z-20">
          <div>
            {isPersonalized && (
              <div className="mb-4">
                <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-astra-gold">
                  <User size={12} className="animate-pulse" />
                  Хувийн Зөвлөгөө
                </div>
                {chartData && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-5 p-4 py-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm"
                  >
                    <AstroBadge icon={<Sun size={10} className="text-amber-400" />} label="Наран" sign={chartData.sun.sign} />
                    <div className="w-px h-8 bg-white/5 my-auto" />
                    <AstroBadge icon={<Moon size={10} className="text-indigo-300" />} label="Саран" sign={chartData.moon.sign} />
                    {chartData.rising && (
                      <>
                        <div className="w-px h-8 bg-white/5 my-auto" />
                        <AstroBadge icon={<Navigation size={10} className="text-emerald-400" />} label="Мандах" sign={chartData.rising.sign} />
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 p-1 bg-white/5 rounded-full border border-white/10">
              <button 
                onClick={() => shareToSocial('facebook')}
                className="p-2 hover:bg-indigo-500/20 rounded-full text-slate-400 hover:text-indigo-400 transition-all active:scale-90"
                title="Facebook"
              >
                <Facebook size={14} />
              </button>
              <button 
                onClick={() => shareToSocial('twitter')}
                className="p-2 hover:bg-sky-500/20 rounded-full text-slate-400 hover:text-sky-400 transition-all active:scale-90"
                title="Twitter"
              >
                <Twitter size={14} />
              </button>
            </div>
            <button 
              onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all active:scale-95 ${
                copied 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300'
              }`}
              title={copied ? 'Холбоос хуулсан' : 'Хуваалцах'}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Хууллаа</span>
                </>
              ) : (
                <>
                  <Share2 size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Хуваалцах</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 relative z-10 mt-2">
          <div>
            <span 
              className="text-[10px] uppercase tracking-widest font-mono font-bold transition-colors duration-500"
              style={{ color: getColorHex(data.color) }}
            >
              Өнөөдрийн орд
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-1">{SIGN_NAMES_MN[data.sign] || data.sign}</h2>
            <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">{data.date}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
            <span className="text-[10px] uppercase tracking-tighter text-slate-500 mb-2 font-bold">Одоогийн байдал</span>
            <span 
              className="text-lg font-medium px-4 py-1.5 rounded-full border uppercase text-[10px] tracking-widest transition-colors duration-500"
              style={{ 
                color: getColorHex(data.color), 
                backgroundColor: `${getColorHex(data.color)}15`,
                borderColor: `${getColorHex(data.color)}30`
              }}
            >
              {data.mood}
            </span>
          </div>
        </div>

        <div className="mb-8 md:mb-10 leading-relaxed font-sans text-base md:text-lg text-slate-300 relative z-10 px-4 md:px-8 py-6 md:py-8 bg-white/5 rounded-3xl border border-white/5 italic">
          "{data.dailyMessage}"
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 relative z-10">
          <StatBox icon={<Heart size={16} />} label="Хайр" value={data.areas.love} color={getColorHex(data.color)} />
          <StatBox icon={<Briefcase size={16} />} label="Ажил" value={data.areas.career} color={getColorHex(data.color)} />
          <StatBox icon={<Activity size={16} />} label="Эрүүл" value={data.areas.health} color={getColorHex(data.color)} />
          <StatBox icon={<Landmark size={16} />} label="Мөнгө" value={data.areas.money} color={getColorHex(data.color)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5 text-center relative z-10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Азтай өнгө</div>
            <div className="flex items-center justify-center gap-2">
              <div 
                className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                style={{ backgroundColor: getColorHex(data.color) }} 
              />
              <span className="text-sm font-medium text-white">{data.color}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Азтай тоо</div>
            <div className="text-2xl font-light transition-colors duration-500" style={{ color: getColorHex(data.color) }}>
              {data.luckyNumber < 10 ? `0${data.luckyNumber}` : data.luckyNumber}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Тохиромжтой орд</div>
            <div className="text-sm font-medium text-white">{data.compatibility}</div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color?: string }) {
  const themeColor = color || '#6366f1';
  return (
    <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl flex flex-col items-center group transition-all duration-500 hover:bg-white/5 shadow-lg">
      <div className="mb-3 group-hover:scale-110 transition-transform" style={{ color: themeColor }}>{icon}</div>
      <div className="text-[10px] uppercase text-slate-500 mb-3 font-mono font-bold">{label}</div>
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-1000 ease-out rounded-full" 
          style={{ 
            width: `${(value / 5) * 100}%`,
            background: `linear-gradient(to right, ${themeColor}, ${themeColor}aa)` 
          }}
        />
      </div>
    </div>
  );
}
