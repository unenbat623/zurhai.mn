import type React from 'react';

interface Props {
  color: string;
  icon: React.ReactNode;
  meaning: string;
  sign: string;
  title: string;
}

export default function ChartSignCard({ color, icon, meaning, sign, title }: Props) {
  return (
    <div className="glass-card group flex flex-col items-center border-white/5 bg-slate-900/50 p-6 text-center transition-all duration-500 hover:border-indigo-500/30">
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg transition-transform duration-500 group-hover:scale-110`}>
        {icon}
      </div>
      <div className="mb-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{title}</div>
      <h3 className="mb-4 font-serif text-2xl italic text-white">{sign}</h3>
      <p className="line-clamp-3 text-xs leading-relaxed text-slate-400 transition-all duration-500 group-hover:line-clamp-none">{meaning}</p>
    </div>
  );
}
