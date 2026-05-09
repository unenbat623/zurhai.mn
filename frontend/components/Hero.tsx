import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <div className="mb-10 text-center md:mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400 md:mb-6 md:text-[10px]"
      >
        <Sparkles size={12} />
        Одод танд зориулагдсан байна
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="sleek-glow mb-4 text-center font-serif text-3xl font-bold tracking-tighter text-white sm:text-5xl md:mb-6 md:text-8xl"
      >
        Таны <span className="text-indigo-400">Тэнгэрийн</span> Хөтөч
      </motion.h2>
      <p className="mx-auto max-w-2xl px-4 text-center font-sans text-base font-light leading-relaxed text-slate-400 md:text-lg">
        AI-д суурилсан хувийн зурхайгаар сансрын урсгалыг чиглүүл. Таны хувь тавилан, аз болон ирээдүйн талаар гүн ойлголт.
      </p>
    </div>
  );
}
