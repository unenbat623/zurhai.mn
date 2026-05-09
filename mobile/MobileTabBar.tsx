import { NAV_TABS } from '../frontend/constants';
import type { ActiveTab } from '../frontend/frontendTypes';

interface Props {
  activeTab: ActiveTab;
  alwaysVisible?: boolean;
  onChange: (tab: ActiveTab) => void;
}

export default function MobileTabBar({ activeTab, alwaysVisible = false, onChange }: Props) {
  return (
    <div className={`${alwaysVisible ? '' : 'lg:hidden'} fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#08080C]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl`}>
      <div className="grid grid-cols-7 gap-1 py-2">
        {NAV_TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-label={tab.label}
              className={`relative flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[8px] font-bold uppercase transition-colors ${
                active ? 'text-indigo-300' : 'text-slate-500'
              }`}
            >
              {active && <span className="absolute inset-0 rounded-xl bg-indigo-500/15" />}
              <span className="relative z-10">{tab.icon}</span>
              {active && <span className="relative z-10 h-1 w-1 rounded-full bg-indigo-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
