import { NAV_TABS } from '../constants';
import type { ActiveTab } from '../frontendTypes';
import TabButton from './TabButton';

interface Props {
  activeTab: ActiveTab;
  isPremium?: boolean;
  onChange: (tab: ActiveTab) => void;
}

export default function MainTabs({ activeTab, onChange }: Props) {
  return (
    <div className="sticky top-[65px] z-40 -mx-4 hidden bg-[#08080C]/80 px-4 py-4 backdrop-blur-md lg:block lg:static lg:mx-0 lg:bg-transparent">
      <div className="flex justify-center">
        <div role="tablist" aria-label="Зурхайн хэсгүүд" className="no-scrollbar flex max-w-full snap-x gap-1 overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/50 p-1">
          {NAV_TABS.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              isLocked={false}
              label={tab.label}
              onClick={() => onChange(tab.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
