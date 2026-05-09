import type { LucideIcon } from 'lucide-react';

interface Props {
  body: string;
  icon: LucideIcon;
  onUpgrade: () => void;
}

export default function PremiumGate({ body, icon: Icon, onUpgrade }: Props) {
  return (
    <div className="glass-card mx-auto max-w-2xl border-white/5 bg-slate-900/40 py-24 text-center">
      <Icon size={48} className="mx-auto mb-6 text-indigo-500 opacity-40 transition-opacity hover:opacity-100" />
      <h3 className="mb-4 text-2xl font-light italic text-white">Премиум онцлог</h3>
      <p className="mx-auto mb-8 max-w-md text-slate-500">{body}</p>
      <button onClick={onUpgrade} className="rounded-xl bg-indigo-600 px-10 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500">
        Одоо сайжруулах
      </button>
    </div>
  );
}
