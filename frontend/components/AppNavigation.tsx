import { SIGN_NAMES_MN, type UserProfile } from '../types';
import type { ActiveTab } from '../frontendTypes';
import BrandMark from './BrandMark';

interface Props {
  activeTab: ActiveTab;
  isPremium: boolean;
  userProfile: UserProfile | null;
  onSetTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  onOpenSubscription: () => void;
}

export default function AppNavigation({ activeTab, isPremium, onOpenSettings, onOpenSubscription, onSetTab, userProfile }: Props) {
  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-[#08080C]/90 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center space-x-4 md:space-x-10">
        <BrandMark />
        <div className="hidden space-x-6 text-sm font-medium text-slate-400 lg:flex">
          <TopLink active={activeTab === 'horoscope'} label="Самбар" onClick={() => onSetTab('horoscope')} />
          <TopLink active={activeTab === 'chart'} label="Профайл" onClick={() => onSetTab('chart')} />
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <button
          onClick={onOpenSettings}
          className="group flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 p-1 pr-1 transition-all hover:bg-white/10 md:gap-3 md:pr-4"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-gradient-to-tr from-indigo-600 to-purple-500 text-[10px] font-serif md:h-8 md:w-8">
            {userProfile?.name?.[0] || 'A'}
          </div>
          <div className="hidden text-left lg:block">
            <p className="max-w-[80px] truncate text-[10px] font-bold uppercase tracking-widest text-white">
              {userProfile?.name || 'Хэрэглэгч'}
            </p>
            <p className="font-mono text-[8px] uppercase text-slate-500">
              {userProfile?.sunSign ? SIGN_NAMES_MN[userProfile.sunSign] : 'Ордгүй'}
            </p>
          </div>
        </button>
        <button
          onClick={onOpenSubscription}
          className="shrink-0 rounded-full bg-astra-gold px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-cosmos-black transition-transform hover:scale-105 md:px-4 md:py-2 md:text-[10px]"
        >
          {isPremium ? 'PLUS' : 'VIP'}
        </button>
      </div>
    </nav>
  );
}

function TopLink({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`py-5 transition-colors ${active ? 'border-b-2 border-indigo-500 text-white' : 'hover:text-white'}`}>
      {label}
    </button>
  );
}
