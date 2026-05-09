import { motion } from 'motion/react';
import { Moon, Navigation, Star } from 'lucide-react';
import BirthChartForm from './BirthChartForm';
import type { BirthChartInterpretation, UserProfile } from '../types';
import ChartSignCard from './ChartSignCard';

interface Props {
  chartInterpretation: BirthChartInterpretation | null;
  isPremium: boolean;
  loading: boolean;
  userProfile: UserProfile | null;
  onClearProfile: () => void;
  onOpenSubscription: () => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export default function ChartSection({ chartInterpretation, isPremium, loading, onClearProfile, onOpenSubscription, onSaveProfile, userProfile }: Props) {
  if (!userProfile) return <BirthChartForm onSave={onSaveProfile} />;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between px-4">
        <h3 className="text-xl font-light text-indigo-300">Хувь тавилангаа нээх нь, {userProfile.name}</h3>
        <button onClick={onClearProfile} className="text-[10px] uppercase tracking-widest text-slate-500 transition-colors hover:text-white">
          Профайл шинэчлэх
        </button>
      </div>

      {loading && (
        <div className="glass-card flex flex-col items-center justify-center p-20">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }}>
            <Moon className="h-12 w-12 text-indigo-500/50" />
          </motion.div>
          <p className="mt-8 italic text-slate-400">Тэнгэрийн зураглалыг тайлж байна...</p>
        </div>
      )}

      {!loading && chartInterpretation && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ChartSignCard title="Наран орд" sign={chartInterpretation.sun.sign} meaning={chartInterpretation.sun.meaning} icon={<Star size={24} />} color="from-amber-400 to-orange-600" />
            <ChartSignCard title="Саран орд" sign={chartInterpretation.moon.sign} meaning={chartInterpretation.moon.meaning} icon={<Moon size={24} />} color="from-indigo-400 to-blue-600" />
            {chartInterpretation.rising && (
              <ChartSignCard title="Мандах орд" sign={chartInterpretation.rising.sign} meaning={chartInterpretation.rising.meaning} icon={<Navigation size={24} />} color="from-emerald-400 to-teal-600" />
            )}
          </div>

          <div className="glass-card relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-slate-900/40 p-8 md:p-12">
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-indigo-500/10 blur-3xl" />
            <div className="prose prose-invert relative z-10 max-w-none">
              <h4 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">Ерөнхий зураглал</h4>
              <div className="whitespace-pre-wrap font-serif text-lg leading-[1.8] text-slate-300 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-5xl first-letter:text-indigo-400">
                {chartInterpretation.summary}
              </div>
            </div>

            {!isPremium && (
              <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8 md:flex-row">
                <div>
                  <h4 className="mb-1 font-bold text-indigo-400">Амьдралын гүн зураглал түгжигдсэн</h4>
                  <p className="text-xs text-slate-500">Ажил мэргэжил болон харилцааны нууцыг нээхийн тулд сайжруулна уу.</p>
                </div>
                <button onClick={onOpenSubscription} className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-600/20 transition-transform hover:bg-indigo-500 active:scale-95">
                  Бүх нууцыг нээх
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
