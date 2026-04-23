import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Search, Sparkles, AlertCircle, Zap, MessageSquare, Flame, Smile, Shield, Lock, Clock, History } from 'lucide-react';
import { ZodiacSign, ZODIAC_SIGNS, SIGN_NAMES_MN, CompatibilityResult } from '../types';
import { fetchCompatibility, fetchDailyCompatibility } from '../services/geminiService';
import { toast } from '../lib/toast';

interface Props {
  userSign?: ZodiacSign;
}

export default function CompatibilityView({ userSign }: Props) {
  const [sign1, setSign1] = useState<ZodiacSign | null>(userSign || null);
  const [sign2, setSign2] = useState<ZodiacSign | null>(null);
  const [generalResult, setGeneralResult] = useState<CompatibilityResult | null>(null);
  const [dailyResult, setDailyResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'general' | 'daily'>('general');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCalculate = async () => {
    if (!sign1 || !sign2) return;
    setLoading(true);
    setError(null);
    try {
      if (mode === 'daily') {
        const data = await fetchDailyCompatibility(sign1, sign2);
        setDailyResult(data);
      } else {
        const data = await fetchCompatibility(sign1, sign2);
        setGeneralResult(data);
      }
    } catch (e: any) {
      console.error(e);
      if (e.message === 'QUOTA_EXCEEDED') {
        setError('QUOTA_EXCEEDED');
      } else {
        toast.error('Тохироог шинжлэхэд алдаа гарлаа. Дараа дахин оролдоно уу.');
      }
    } finally {
      setLoading(false);
    }
  };

  const activeResult = mode === 'daily' ? dailyResult : generalResult;

  // Clear results if signs change
  useEffect(() => {
    setGeneralResult(null);
    setDailyResult(null);
  }, [sign1, sign2]);

  useEffect(() => {
    if (userSign && !sign1) {
      setSign1(userSign);
    }
  }, [userSign]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Mode Toggle & Celestial Clock */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="flex flex-col md:flex-row items-center gap-6 w-full justify-between">
          {/* Celestial Clock */}
          <div className="flex items-center gap-4 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-bold">Одоогийн цаг</span>
              <span className="text-sm font-mono text-indigo-300 font-bold leading-none mt-1">
                {currentTime.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-[0.2em] text-slate-500 font-bold">Огноо</span>
              <span className="text-sm font-mono text-slate-300 font-bold leading-none mt-1">
                {currentTime.toLocaleDateString('mn-MN')}
              </span>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="bg-slate-900/50 p-1 rounded-2xl border border-white/5 flex gap-1 shadow-inner">
            <button
              onClick={() => setMode('general')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'general' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
            >
              Ерөнхий Тохироо
            </button>
            <button
              onClick={() => setMode('daily')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'daily' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
            >
              Өнөөдрийн Энерги
            </button>
          </div>

          {/* Reset Status (if daily) */}
          <div className={`transition-all duration-500 ${mode === 'daily' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
              <Clock size={16} className="text-amber-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-[0.2em] text-amber-500/60 font-bold">Шинэчлэгдэхэд</span>
                <span className="text-xs font-mono text-amber-400 font-bold leading-none mt-1">
                  {23 - currentTime.getHours()}ц {59 - currentTime.getMinutes()}м үлдлээ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative">
          <SignSelector 
            label={userSign ? "Таны Орд" : "Эхний Орд"} 
            selected={sign1} 
            onSelect={setSign1} 
          />
          {userSign && sign1 === userSign && (
            <div className="absolute top-8 right-8 text-[8px] font-bold text-astra-gold bg-astra-gold/10 px-2 py-0.5 rounded border border-astra-gold/20 flex items-center gap-1 uppercase tracking-widest">
              <Sparkles size={8} /> Таны Профайл
            </div>
          )}
        </div>
        <SignSelector 
          label="Хоёр дахь Орд" 
          selected={sign2} 
          onSelect={setSign2} 
        />
      </div>

      <div className="flex justify-center mb-16">
        <button
          id="calculate-compatibility-btn"
          onClick={handleCalculate}
          disabled={!sign1 || !sign2 || loading}
          aria-label="Тохироог тооцоолох"
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-12 py-4 rounded-2xl font-bold tracking-widest uppercase text-xs shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <Heart size={18} />
          {loading ? 'Шинжилж байна...' : 'ТОХИРООГ ШИНЖЛЭХ'}
        </button>
      </div>

      <div aria-live="polite" aria-atomic="true">
        {error === 'QUOTA_EXCEEDED' && (
          <div className="text-center py-24 glass-card border-indigo-500/30 bg-indigo-500/5">
            <Sparkles size={48} className="mx-auto text-astra-gold mb-6 animate-pulse" />
            <h3 className="text-2xl font-serif text-white mb-4 italic">Сансрын энерги цэнэг авч байна</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">Тохирооны шинжилгээний энерги түр хугацаанд саатлаа. Одод дахин нэгдэх хүртэл хүлээгээд дахин оролдоно уу.</p>
            <button 
              onClick={handleCalculate}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
            >
              Дахин оролдох
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center p-12 glass-card min-h-[400px]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-12 h-12 text-indigo-400 opacity-50" />
            </motion.div>
            <p className="mt-4 text-white/60 font-sans italic">Одод болон тохироог шинжилж байна...</p>
          </div>
        )}

        {activeResult && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 bg-gradient-to-br from-indigo-900/30 to-slate-900 border-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[120px] -z-10" />

            <div className="text-center mb-16">
              <div className="relative inline-flex items-center justify-center mb-8">
                <svg className="w-48 h-48 md:w-56 md:h-56 transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className="stroke-white/5 fill-none"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className={mode === 'daily' ? "stroke-amber-500 fill-none" : "stroke-indigo-500 fill-none"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 1000" }}
                    animate={{ strokeDasharray: `${(activeResult.score / 100) * 283} 1000` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`absolute -top-6 -right-6 backdrop-blur-md border p-3 rounded-full ${mode === 'daily' ? 'bg-amber-600/30 border-amber-500/30' : 'bg-indigo-600/30 border-indigo-500/30'}`}
                  >
                    {mode === 'daily' ? <Zap className="text-astra-gold animate-pulse" size={24} /> : <Heart className="text-rose-400" size={24} />}
                  </motion.div>
                  <motion.span 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                    className={`text-5xl md:text-6xl font-serif font-bold text-white sleek-glow ${mode === 'daily' ? 'text-amber-100' : 'text-white'}`}
                  >
                    {activeResult.score}%
                  </motion.span>
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className={`text-[10px] uppercase tracking-[0.4em] font-bold mt-2 ${mode === 'daily' ? 'text-amber-500' : 'text-indigo-400'}`}
                  >
                    {mode === 'daily' ? 'Өнөөдөр' : 'Тохироо'}
                  </motion.span>
                </div>
                
                {/* Decorative particles */}
                <AnimatePresence>
                  {activeResult.score > 70 && (
                    <motion.div 
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{ 
                            scale: [0, 1, 0],
                            x: (Math.random() - 0.5) * 200,
                            y: (Math.random() - 0.5) * 200,
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            delay: i * 0.3,
                            ease: "easeOut"
                          }}
                          className="absolute left-1/2 top-1/2"
                        >
                          <Sparkles size={12} className="text-astra-gold opacity-60" />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6 uppercase tracking-tight">
                {mode === 'daily' ? 'Өнөөдрийн Тохироо' : 'Ерөнхий тохироо'}
              </h3>
              {mode === 'daily' && (
                <div className="mb-8 flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                    <History size={12} />
                    Сүүлд шинэчлэгдсэн: Өнөөдөр {new Date().toLocaleDateString('mn-MN')}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                    <Clock size={12} />
                    Шинэчлэгдэхэд: {24 - new Date().getHours()} цаг үлдлээ
                  </div>
                </div>
              )}
              <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans font-light text-lg italic">
                "{activeResult.summary}"
              </p>
            </div>

            {/* Aspect Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
              <AspectBar 
                label="Харилцаа" 
                value={activeResult.breakdown.communication} 
                icon={<MessageSquare size={14} />}
                color="indigo"
              />
              <AspectBar 
                label="Хүсэл" 
                value={activeResult.breakdown.passion} 
                icon={<Flame size={14} />}
                color="rose"
              />
              <AspectBar 
                label="Сэтгэл" 
                value={activeResult.breakdown.emotional} 
                icon={<Smile size={14} />}
                color="purple"
              />
              <AspectBar 
                label="Үнэт зүйл" 
                value={activeResult.breakdown.values} 
                icon={<Shield size={14} />}
                color="amber"
              />
              <AspectBar 
                label="Итгэлцэл" 
                value={activeResult.breakdown.trust} 
                icon={<Lock size={14} />}
                color="emerald"
              />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/5">
            <div>
              <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-indigo-400 mb-6 flex items-center gap-2 font-mono">
                <Sparkles size={14} />
                {mode === 'daily' ? 'Өнөөдрийн Давуу Тал' : 'Үндсэн Давуу Тал'}
              </h4>
              <ul className="space-y-4">
                {activeResult.strengths.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase font-bold tracking-[0.3em] text-rose-400 mb-6 flex items-center gap-2 font-mono">
                <AlertCircle size={14} />
                {mode === 'daily' ? 'Өнөөдрийн Сорилт & Шийдэл' : 'Анхаарах Зүйлс & Шийдэл'}
              </h4>
              <div className="space-y-6">
                {activeResult.challenges.map((c, i) => (
                  <div key={i} className="glass-card p-5 bg-rose-500/5 border-rose-500/10 space-y-3">
                    <h5 className="text-xs font-bold text-rose-300 uppercase tracking-wider">{c.title}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">"{c.explanation}"</p>
                    <div className="pt-2 flex gap-2 items-start border-t border-rose-500/10">
                       <Zap size={10} className="text-emerald-400 mt-1 shrink-0" />
                       <p className="text-[11px] text-emerald-400/80 font-medium">Шийдэл: {c.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </div>

      <div className="mt-20">
        <h3 className="text-xl font-serif text-white mb-8 text-center uppercase tracking-widest italic">Ордуудын тохирооны хүснэгт</h3>
        <CompatibilityChart onSelectPair={(s1, s2) => {
          setSign1(s1);
          setSign2(s2);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          // Auto-calculate after a short delay for smoothness
          setTimeout(() => {
            const btn = document.getElementById('calculate-compatibility-btn');
            if (btn) btn.click();
          }, 600);
        }} />
      </div>
    </div>
  );
}

function CompatibilityChart({ onSelectPair }: { onSelectPair: (s1: ZodiacSign, s2: ZodiacSign) => void }) {
  const [hovered, setHovered] = useState<{ s1: ZodiacSign, s2: ZodiacSign } | null>(null);

  // Approximate compatibility logic for the chart
  const getScore = (s1: ZodiacSign, s2: ZodiacSign) => {
    const elements: Record<ZodiacSign, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
      Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
      Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
      Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
      Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
    };

    if (s1 === s2) return 95;
    if (elements[s1] === elements[s2]) return 85;
    
    const elementMatch: Record<string, number> = {
      'Fire-Air': 80, 'Air-Fire': 80,
      'Earth-Water': 80, 'Water-Earth': 80,
      'Fire-Earth': 40, 'Earth-Fire': 40,
      'Air-Water': 40, 'Water-Air': 40,
      'Fire-Water': 30, 'Water-Fire': 30,
      'Earth-Air': 30, 'Air-Earth': 30
    };

    return elementMatch[`${elements[s1]}-${elements[s2]}`] || 60;
  };

  const getColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-500';
    if (score >= 80) return 'bg-indigo-500';
    if (score >= 60) return 'bg-indigo-500/50';
    if (score >= 40) return 'bg-rose-500/50';
    return 'bg-rose-500';
  };

  return (
    <div className="glass-card p-4 md:p-8 overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="grid grid-cols-[100px_repeat(12,1fr)] gap-1">
          <div />
          {ZODIAC_SIGNS.map(s => (
            <div key={s} className="text-[8px] font-bold text-slate-500 text-center uppercase tracking-tighter truncate">
              {SIGN_NAMES_MN[s].slice(0, 3)}
            </div>
          ))}
          
          {ZODIAC_SIGNS.map(s1 => (
            <React.Fragment key={s1}>
              <div className="text-[8px] font-bold text-slate-500 flex items-center uppercase tracking-tighter truncate pr-2">
                {SIGN_NAMES_MN[s1]}
              </div>
              {ZODIAC_SIGNS.map(s2 => {
                const score = getScore(s1, s2);
                const isHoveredSide = hovered?.s1 === s1 || hovered?.s2 === s2;
                const isExact = hovered?.s1 === s1 && hovered?.s2 === s2;
                
                return (
                  <motion.button
                    key={`${s1}-${s2}`}
                    onMouseEnter={() => setHovered({ s1, s2 })}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelectPair(s1, s2)}
                    className={`h-8 rounded-sm ${getColor(score)} transition-all duration-300 relative group`}
                    animate={{
                      opacity: hovered ? (isHoveredSide ? 1 : 0.2) : 1,
                      scale: isExact ? 1.2 : 1,
                      zIndex: isExact ? 10 : 1
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-[8px] font-bold text-white leading-none whitespace-nowrap bg-black/80 px-1 py-0.5 rounded">
                        {score}%
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-6 text-[9px] uppercase font-bold tracking-widest text-slate-500">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500" /> Төгс</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-indigo-500" /> Сайн</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-indigo-500/50" /> Дундаж</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-rose-500/50" /> Тааруу</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-rose-500" /> Зөрчилтэй</div>
        </div>
      </div>
    </div>
  );
}

function AspectBar({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
  const getColorClasses = (c: string) => {
    switch (c) {
      case 'indigo': return 'from-indigo-500 to-indigo-400 text-indigo-400 shadow-indigo-500/20';
      case 'rose': return 'from-rose-500 to-rose-400 text-rose-400 shadow-rose-500/20';
      case 'purple': return 'from-purple-500 to-purple-400 text-purple-400 shadow-purple-500/20';
      case 'amber': return 'from-amber-500 to-amber-400 text-amber-400 shadow-amber-500/20';
      case 'emerald': return 'from-emerald-500 to-emerald-400 text-emerald-400 shadow-emerald-500/20';
      default: return 'from-indigo-500 to-indigo-400 text-indigo-400 shadow-indigo-500/20';
    }
  };

  const bgClasses = getColorClasses(color);

  return (
    <div className="glass-card p-5 bg-white/5 border-white/5 flex flex-col gap-4 group hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg bg-white/5 ${bgClasses.split(' ')[2]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-[14px] font-mono font-bold text-white">{value}%</span>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">{label}</div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1.5, delay: 0.8, ease: "circOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${bgClasses.split(' ').slice(0, 2).join(' ')} shadow-lg`}
          />
        </div>
      </div>
    </div>
  );
}

function SignSelector({ label, selected, onSelect }: { label: string, selected: ZodiacSign | null, onSelect: (s: ZodiacSign) => void }) {
  return (
    <div className="glass-card p-8 bg-slate-900/30 border-white/5">
      <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 mb-6 block">{label}</span>
      <div className="grid grid-cols-4 gap-3">
        {ZODIAC_SIGNS.map(s => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={`p-3 rounded-xl transition-all ${
              selected === s 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'bg-slate-900/50 text-slate-500 hover:text-white border border-white/5'
            } text-xs font-bold uppercase tracking-tighter`}
          >
            {SIGN_NAMES_MN[s].slice(0, 4)}
          </button>
        ))}
      </div>
    </div>
  );
}
