import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface Props {
  error: string | null;
  onRetry: () => void;
}

export default function QuotaError({ error, onRetry }: Props) {
  return (
    <AnimatePresence>
      {error === 'QUOTA_EXCEEDED' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-card relative mb-12 overflow-hidden border-indigo-500/30 bg-indigo-500/5 p-8 text-center"
        >
          <div className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
          <div className="relative z-10">
            <Sparkles className="mx-auto mb-4 h-12 w-12 animate-pulse text-astra-gold" />
            <h3 className="mb-2 font-serif text-2xl italic text-white">Сансрын энерги цэнэг авч байна</h3>
            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-400">
              Өнөөдрийн мэдээллийн урсгал түр завсарлалаа. Хэсэг хүлээгээд дахин оролдоно уу.
            </p>
            <button onClick={onRetry} className="rounded-xl bg-indigo-600 px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500">
              Дахин оролдох
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
