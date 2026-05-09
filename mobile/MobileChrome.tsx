import { Hash, Moon, Settings, Sparkles, User, Zap } from 'lucide-react';
import type React from 'react';
import { SIGN_DATES, SIGN_NAMES_MN, ZODIAC_SIGNS, type ZodiacSign } from '../frontend/types';

const COPY = {
  title: '\u0422\u0430\u043d\u044b \u0437\u0443\u0440\u0445\u0430\u0439',
  dailyDirection: '\u04e8\u043d\u04e9\u04e9\u0434\u0440\u0438\u0439\u043d \u043e\u0434\u0434\u044b\u043d \u0447\u0438\u0433\u043b\u044d\u043b',
  personalDirection: '\u04e9\u043d\u04e9\u04e9\u0434\u0440\u0438\u0439\u043d \u0447\u0438\u0433\u043b\u044d\u043b',
  profile: '\u041f\u0440\u043e\u0444\u0430\u0439\u043b',
  sign: '\u041e\u0440\u0434',
  profilePrompt: '\u041f\u0440\u043e\u0444\u0430\u0439\u043b \u04af\u04af\u0441\u0433\u044d\u044d\u0434 \u0438\u043b\u04af\u04af \u0445\u0443\u0432\u0438\u0439\u043d \u0437\u0443\u0440\u0445\u0430\u0439 \u0430\u0432\u0430\u0430\u0440\u0430\u0439.',
  signAdvice: '\u043e\u0440\u0434\u043e\u0434 \u0437\u043e\u0440\u0438\u0443\u043b\u0441\u0430\u043d \u0431\u043e\u0433\u0438\u043d\u043e, \u0445\u044d\u0440\u044d\u0433\u0436\u0438\u0445\u04af\u0439\u0446 \u0437\u04e9\u0432\u043b\u04e9\u0433\u04e9\u04e9.',
};

export function MobileHeader({
  isPremium,
  onOpenSettings,
  onOpenSubscription,
  userName,
}: {
  isPremium: boolean;
  onOpenSettings: () => void;
  onOpenSubscription: () => void;
  userName?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#08080C]/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500">
            <Moon size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-300">Astra AI</p>
            <h1 className="truncate text-sm font-semibold text-white">{userName || COPY.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onOpenSettings} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white" aria-label="Settings">
            <Settings size={15} />
          </button>
          <button onClick={onOpenSubscription} className="rounded-full bg-astra-gold px-3 py-2 text-[9px] font-black uppercase tracking-widest text-cosmos-black">
            {isPremium ? 'Plus' : 'VIP'}
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileHomeCard({
  isPremium,
  onOpenChart,
  onOpenSubscription,
  signName,
  userName,
}: {
  isPremium: boolean;
  onOpenChart: () => void;
  onOpenSubscription: () => void;
  signName?: string;
  userName?: string;
}) {
  return (
    <section className="glass-card overflow-hidden border-white/10 bg-slate-900/40 p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-300">
            <Sparkles size={11} />
            Application
          </div>
          <h2 className="text-2xl font-serif font-bold leading-tight text-white">
            {userName ? `${userName}, ${COPY.personalDirection}` : COPY.dailyDirection}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {signName ? `${signName} ${COPY.signAdvice}` : COPY.profilePrompt}
          </p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
          <Hash size={22} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <AppAction icon={<User size={15} />} label={COPY.profile} value={signName || COPY.sign} onClick={onOpenChart} />
        <AppAction icon={<Zap size={15} />} label="Plus" value={isPremium ? 'Active' : 'VIP'} onClick={onOpenSubscription} />
      </div>
    </section>
  );
}

export function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-indigo-300">{icon}</div>
      <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">{title}</h2>
    </div>
  );
}

export function MobileZodiacGrid({ onSelect, selectedSign }: { onSelect: (sign: ZodiacSign) => void; selectedSign: ZodiacSign | null }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ZODIAC_SIGNS.map(sign => {
        const selected = selectedSign === sign;
        return (
          <button
            key={sign}
            type="button"
            onClick={() => onSelect(sign)}
            className={`flex aspect-square flex-col items-center justify-center rounded-2xl border transition-colors ${
              selected ? 'border-indigo-400 bg-indigo-500/20 text-white' : 'border-white/10 bg-slate-900/40 text-slate-300'
            }`}
          >
            <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-2xl text-indigo-200">{zodiacSymbol(sign)}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{SIGN_NAMES_MN[sign]}</span>
            <span className="mt-1 text-[8px] text-slate-500">{SIGN_DATES[sign]}</span>
          </button>
        );
      })}
    </div>
  );
}

function AppAction({ icon, label, onClick, value }: { icon: React.ReactNode; label: string; onClick: () => void; value: string }) {
  return (
    <button onClick={onClick} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left transition-colors active:bg-white/10">
      <div className="mb-2 text-indigo-300">{icon}</div>
      <span className="block text-[10px] font-bold uppercase tracking-widest text-white">{label}</span>
      <span className="mt-1 block truncate text-[10px] text-slate-500">{value}</span>
    </button>
  );
}

function zodiacSymbol(sign: ZodiacSign) {
  const symbols: Record<ZodiacSign, string> = {
    Aries: '\u2648',
    Taurus: '\u2649',
    Gemini: '\u264a',
    Cancer: '\u264b',
    Leo: '\u264c',
    Virgo: '\u264d',
    Libra: '\u264e',
    Scorpio: '\u264f',
    Sagittarius: '\u2650',
    Capricorn: '\u2651',
    Aquarius: '\u2652',
    Pisces: '\u2653',
  };

  return symbols[sign];
}
