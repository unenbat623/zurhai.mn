
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, RefreshCw, AlertCircle, Info, Zap, Sparkles } from 'lucide-react';

interface Props {
  error: string | null;
  onRetry: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export default function QuotaStatus({ error, onRetry, isPremium, onUpgrade }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryScheduled, setRetryScheduled] = useState(false);

  // Estimates - would ideally come from backend
  const MAX_QUOTA = isPremium ? 1000 : 15;
  const [usedQuota, setUsedQuota] = useState(0);

  useEffect(() => {
    // Tracking usage via localStorage for visual estimation
    const savedUsage = localStorage.getItem('astra_quota_usage');
    if (savedUsage) {
      setUsedQuota(parseInt(savedUsage));
    }
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(9, 0, 0, 0); // Reset at 09:00 AM
      
      if (now.getHours() >= 9) {
        nextReset.setDate(nextReset.getDate() + 1);
      }
      
      const diff = nextReset.getTime() - now.getTime();
      
      setCountdown({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(timer);
  }, []);

  const handleManualRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      onRetry();
      setIsRetrying(false);
    }, 1000);
  };

  const handleRetryLater = () => {
    setRetryScheduled(true);
    // Intelligent scheduling: retry after 5 minutes or small period if quota might have dynamic reset
    // For fixed window (like 09:00 AM), we can retry then, but for demo we retry in 30s
    setTimeout(() => {
      onRetry();
      setRetryScheduled(false);
    }, 30000); 
  };

  const remaining = Math.max(0, MAX_QUOTA - usedQuota);
  const percentage = (remaining / MAX_QUOTA) * 100;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
          error === 'QUOTA_EXCEEDED' 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
            : percentage < 20
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold animate-pulse'
            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
        }`}
      >
        <Zap size={14} className={error === 'QUOTA_EXCEEDED' ? 'animate-bounce' : ''} />
        <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">
          {error === 'QUOTA_EXCEEDED' ? 'Хязгаар Дууссан' : `${Math.round(percentage)}% Энерги`}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 glass-card bg-slate-900 border-indigo-500/30 p-6 z-50 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-400">Энергийн Төлөв</h4>
                <div className={`w-2 h-2 rounded-full ${error === 'QUOTA_EXCEEDED' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} />
              </div>

              <div className="space-y-6">
                {/* Quota Bar */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-slate-400">Ашиглах боломж</span>
                    <span className={`text-sm font-bold ${percentage < 20 ? 'text-amber-500' : 'text-white'}`}>
                      {remaining} / {MAX_QUOTA}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className={`h-full transition-colors ${
                        percentage < 10 ? 'bg-rose-500' : percentage < 30 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Clock size={16} className="text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Дараагийн шинэчлэл</span>
                      <span className="text-xs font-mono font-bold text-indigo-300">
                        {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed pt-2 border-t border-white/5">
                    Үнэгүй хувилбарын энерги өдөр бүр 09:00 цагт шинэчлэгддэг.
                  </p>
                </div>

                {error === 'QUOTA_EXCEEDED' ? (
                  <div className="grid grid-cols-1 gap-3 pt-2">
                    <button 
                      onClick={handleManualRetry}
                      disabled={isRetrying}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
                      {isRetrying ? 'Шалгаж байна...' : 'Одоо шалгах'}
                    </button>
                    <button 
                      onClick={handleRetryLater}
                      disabled={retryScheduled}
                      className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                        retryScheduled 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {retryScheduled ? <Clock size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      {retryScheduled ? '30с дараа оролдоно...' : 'Дараа оролдох'}
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    {!isPremium && (
                      <button 
                        onClick={onUpgrade}
                        className="w-full p-4 bg-astra-gold/10 border border-astra-gold/20 rounded-2xl flex items-center gap-4 group text-left transition-all hover:bg-astra-gold/20"
                      >
                        <div className="w-10 h-10 bg-astra-gold/20 rounded-full flex items-center justify-center text-astra-gold group-hover:scale-110 transition-transform">
                          <Zap size={20} />
                        </div>
                        <div>
                          <h5 className="text-[10px] font-bold text-white mb-0.5 uppercase tracking-wider">VIP болж энергиэ нэмээрэй</h5>
                          <p className="text-[9px] text-slate-400">Хязгааргүй ашиглах боломжтой</p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
