import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import type React from 'react';

interface Props {
  active: boolean;
  icon: React.ReactNode;
  isLocked?: boolean;
  key?: React.Key;
  label: string;
  onClick: () => void;
}

export default function TabButton({ active, icon, isLocked, label, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      aria-label={`${label}${isLocked ? ' (Premium)' : ''}`}
      className={`relative flex snap-center items-center gap-2 overflow-hidden whitespace-nowrap rounded-xl px-3 py-2.5 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 sm:gap-3 sm:px-6 sm:py-3 ${
        active ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
      }`}
    >
      {active && <motion.div layoutId="tab-active" className="absolute inset-0 rounded-xl border border-indigo-500/20 bg-indigo-500/10" />}
      <span className={`relative z-10 transition-transform duration-500 ${active ? 'scale-110' : 'scale-100 opacity-60'}`}>{icon}</span>
      <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest md:text-xs">{label}</span>
      {isLocked && <Zap size={10} className="relative z-10 ml-1 animate-pulse text-astra-gold" />}
    </button>
  );
}
