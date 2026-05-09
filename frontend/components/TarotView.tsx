import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { TarotCard } from '../types';
import { getTarotReading } from '../services/geminiService';

import { toast } from '../lib/toast';

export default function TarotView() {
  const [card, setCard] = useState<TarotCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pullCard = async () => {
    setLoading(true);
    setIsFlipped(false);
    setError(null);
    try {
      const data = await getTarotReading();
      setCard(data);
      setTimeout(() => setIsFlipped(true), 600); // Wait for card deal animation
    } catch (e: any) {
      console.error(e);
      if (e.message === 'QUOTA_EXCEEDED') {
        setError('QUOTA_EXCEEDED');
      } else {
        toast.error('Карт сугалахад алдаа гарлаа. Ододтой холбогдож чадсангүй. Та түр хүлээгээд дахин оролдоно уу.');
        setError('GENERIC_ERROR');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 font-sans">
      <div className="text-center mb-12">
        <h3 className="text-4xl font-serif text-white mb-4">Өдрийн Тарот Карт</h3>
        <p className="text-slate-400 text-sm font-light">Таны өнөөдрийн эрч хүчийг илэрхийлэх нэг картыг сугална уу.</p>
      </div>

      <div className="flex flex-col items-center gap-12">
        {error === 'QUOTA_EXCEEDED' || error === 'GENERIC_ERROR' ? (
          <div className="text-center py-12 glass-card border-indigo-500/30 bg-indigo-500/5 w-full">
            <Sparkles size={48} className="mx-auto text-astra-gold mb-6 animate-pulse" />
            <h3 className="text-2xl font-serif text-white mb-4 italic">
              {error === 'QUOTA_EXCEEDED' ? 'Сансрын энерги цэнэг авч байна' : 'Ододтой холбогдоход саатал гарлаа'}
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">
              {error === 'QUOTA_EXCEEDED' 
                ? 'Тарот энергийн урсгал түр хугацаанд саатлаа. Одод дахин нэгдэх хүртэл хүлээгээд үзээрэй.' 
                : 'Одод болон гариг эрхэсийн байрлал тогтворгүй байна. Түр хүлээгээд дахин оролдоно уу.'}
            </p>
            <button 
              onClick={pullCard}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
            >
              Дахин оролдох
            </button>
          </div>
        ) : (
          <div className="relative w-64 h-96 perspective-1000">
          <AnimatePresence mode="wait">
            {!card ? (
              <motion.div
                key="deck"
                role="button"
                aria-label="Карт сугалах"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={pullCard}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && pullCard()}
                className="w-full h-full glass-card bg-indigo-900/20 border-indigo-500/30 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <div className="w-48 h-80 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-4 group-hover:scale-105 transition-transform">
                  <Sparkles size={48} className="text-indigo-400/20" />
                  <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-400">Карт Сугалах</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="card"
                role="img"
                aria-label={`Тарот карт: ${card.name}`}
                className={`w-full h-full relative transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {/* Back */}
                <div className="absolute inset-0 w-full h-full backface-hidden glass-card bg-[#0a0a15] border-indigo-500/50 flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                   <div className="w-56 h-88 border-2 border-indigo-500/20 rounded-2xl flex items-center justify-center relative">
                      <div className="absolute inset-4 border border-indigo-500/10 rounded-xl" />
                      <div className="w-32 h-32 rounded-full border border-indigo-500/20 flex items-center justify-center relative">
                         <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                         <motion.div 
                           animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                           transition={{ duration: 4, repeat: Infinity }}
                           className="w-16 h-16 rounded-full bg-indigo-500/10 blur-xl" 
                         />
                         <Sparkles size={32} className="text-indigo-400 opacity-40" />
                      </div>
                   </div>
                </div>
                
                {/* Front */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 glass-card bg-slate-900 border-indigo-500/40 overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] group/card">
                  {/* Card Art Container */}
                  <div className="relative flex-1 overflow-hidden">
                    <img 
                      src={card.imageUrl} 
                      alt={card.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&h=700&auto=format&fit=crop';
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-in-out" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
                    
                    {/* Header Overlay */}
                    <div className="absolute top-4 left-0 w-full text-center px-4">
                      <span className="text-[9px] uppercase font-black Number tracking-[0.4em] text-indigo-400 mb-1 block shadow-sm">{card.arcana} Arcana</span>
                    </div>

                    {/* Footer Overlay */}
                    <div className="absolute bottom-6 left-0 w-full text-center px-6">
                      <h4 className="text-2xl font-serif font-bold text-white uppercase tracking-tight sleek-glow drop-shadow-lg">{card.name}</h4>
                    </div>
                  </div>
                  
                  {/* Pull Again Button if needed or Action bar */}
                  <div className="h-14 bg-slate-950/80 backdrop-blur-md flex items-center justify-center border-t border-white/5 gap-4">
                    <button 
                      onClick={pullCard}
                      className="flex items-center gap-2 text-[10px] items-center uppercase tracking-widest font-bold text-slate-500 hover:text-white transition-colors"
                    >
                      <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                      Дахин сугалах
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        )}

        {card && isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 bg-slate-900/50 border-white/5 space-y-8"
          >
            <div>
              <h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 mb-4 font-mono">Утга Учир</h5>
              <p className="text-slate-300 leading-relaxed font-light">{card.meaning}</p>
            </div>
            <div className="pt-8 border-t border-white/5">
              <h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-indigo-400 mb-4 font-mono">Зөвлөгөө</h5>
              <p className="text-slate-300 leading-relaxed font-sans text-lg italic">"{card.advice}"</p>
            </div>
          </motion.div>
        )}
      </div>
      
      {loading && !card && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08080C]/80 backdrop-blur-xl">
           <div className="flex flex-col items-center gap-12">
              <div className="relative w-32 h-48">
                {/* Mystical Glow Background */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full mt-10"
                />
                
                {/* Shuffling Cards */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{ zIndex: 3 - i }}
                    animate={{
                      x: [0, 80, 0, 0],
                      y: [0, -10, 0, 0],
                      rotate: [0, 15, 0, 0],
                      zIndex: [3 - i, 3 - i, 0, 3 - i]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.6,
                      times: [0, 0.4, 0.6, 1]
                    }}
                    className="absolute inset-0 glass-card bg-slate-900/90 border-indigo-500/30 rounded-xl flex items-center justify-center"
                  >
                    <Sparkles size={24} className="text-indigo-400/20" />
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-indigo-400 uppercase tracking-[0.4em] text-[10px] font-bold mb-2">Орчлон ертөнцтэй холбогдож байна</p>
                <div className="flex gap-1 justify-center">
                  {[0, 1, 2].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                    />
                  ))}
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
