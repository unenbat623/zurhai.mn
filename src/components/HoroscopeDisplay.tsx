
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HoroscopeData, SIGN_NAMES_MN } from '../types';
import { Sparkles, Heart, Briefcase, Activity, Landmark, Moon, User, Share2, Copy, Check } from 'lucide-react';

interface Props {
  data: HoroscopeData | null;
  isLoading: boolean;
  isPersonalized?: boolean;
}

export default function HoroscopeDisplay({ data, isLoading, isPersonalized }: Props) {
  const [copied, setCopied] = useState(false);

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
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy!', err);
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={data.sign}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass-card p-4 sm:p-8 max-w-2xl mx-auto border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 to-slate-900 overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-3xl"></div>
        
        <div className="flex justify-between items-start relative z-20">
          <div>
            {isPersonalized && (
              <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-astra-gold">
                <User size={12} />
                Хувийн Зөвлөгөө
              </div>
            )}
          </div>
          <button 
            onClick={handleShare}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-2 active:scale-95"
            title="Хуваалцах"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
            <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">{copied ? 'Хуулсан' : 'Хуваалцах'}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 relative z-10 mt-2">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-mono font-bold">Өнөөдрийн орд</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-1">{SIGN_NAMES_MN[data.sign] || data.sign}</h2>
            <p className="text-[10px] text-slate-500 mt-2 font-mono uppercase tracking-[0.2em]">{data.date}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
            <span className="text-[10px] uppercase tracking-tighter text-slate-500 mb-2 font-bold">Одоогийн байдал</span>
            <span className="text-lg text-indigo-300 font-medium px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20 uppercase text-[10px] tracking-widest">{data.mood}</span>
          </div>
        </div>

        <div className="mb-8 md:mb-10 leading-relaxed font-sans text-base md:text-lg text-slate-300 relative z-10 px-4 md:px-8 py-6 md:py-8 bg-white/5 rounded-3xl border border-white/5 italic">
          "{data.dailyMessage}"
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 relative z-10">
          <StatBox icon={<Heart size={16} />} label="Хайр" value={data.areas.love} />
          <StatBox icon={<Briefcase size={16} />} label="Ажил" value={data.areas.career} />
          <StatBox icon={<Activity size={16} />} label="Эрүүл" value={data.areas.health} />
          <StatBox icon={<Landmark size={16} />} label="Мөнгө" value={data.areas.money} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5 text-center relative z-10">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Азтай өнгө</div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
              <span className="text-sm font-medium text-white">{data.color}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Азтай тоо</div>
            <div className="text-2xl font-light text-indigo-400">{data.luckyNumber < 10 ? `0${data.luckyNumber}` : data.luckyNumber}</div>
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

function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="bg-slate-900/50 border border-white/5 p-5 rounded-2xl flex flex-col items-center group hover:border-indigo-500/30 transition-colors">
      <div className="text-indigo-400/60 mb-3 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-[10px] uppercase text-slate-500 mb-3 font-mono font-bold">{label}</div>
      <div className="w-full h-1 bg-slate-800 rounded-full">
        <div 
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full" 
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}
