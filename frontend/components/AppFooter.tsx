import { ChevronRight, Moon } from 'lucide-react';
import { SERVICE_LINKS, WORLD_LINKS } from '../constants';
import type { ActiveTab, InfoModalState } from '../frontendTypes';

interface Props {
  onOpenInfo: (state: InfoModalState) => void;
  onSetTab: (tab: ActiveTab) => void;
}

export default function AppFooter({ onOpenInfo, onSetTab }: Props) {
  return (
    <footer className="mt-40 border-t border-white/5 px-6 py-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-12 md:flex-row">
        <div className="max-w-xs cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-astra-gold">
              <Moon className="fill-cosmos-black text-cosmos-black" size={16} />
            </div>
            <h2 className="text-lg font-bold italic tracking-tight text-white">
              ASTRA<span className="font-sans font-light not-italic text-indigo-400">AI</span>
            </h2>
          </div>
          <p className="text-xs uppercase leading-relaxed tracking-wider text-white/30">
            Тэнгэрийн одод, эртний мэргэн ухааныг зохиомлоор дамжуулан дижитал эринд авчирна.
          </p>
        </div>

        <div className="flex flex-col gap-12 sm:flex-row sm:gap-20">
          <FooterLinks
            title="Үйлчилгээ"
            links={SERVICE_LINKS}
            onLinkClick={id => {
              onSetTab(id as ActiveTab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <FooterLinks
            title="Ертөнц"
            links={WORLD_LINKS}
            onLinkClick={id => {
              const link = WORLD_LINKS.find(item => item.id === id);
              if (link) onOpenInfo({ isOpen: true, title: link.name, type: id });
            }}
          />
        </div>

        <div className="text-center md:text-right">
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/20">Тэнгэрийн үйл явдалд бүртгүүлэх</p>
          <form
            onSubmit={event => {
              event.preventDefault();
              alert('Бүртгэл амжилттай!');
              (event.target as HTMLFormElement).reset();
            }}
            className="flex gap-2"
          >
            <input type="email" required placeholder="Таны имэйл" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs focus:border-astra-gold/30 focus:outline-none" />
            <button type="submit" className="rounded-full bg-white p-2 text-black transition-colors hover:bg-astra-gold">
              <ChevronRight size={16} />
            </button>
          </form>
        </div>
      </div>
      <div className="mt-20 text-center text-[10px] uppercase tracking-widest text-white/10">
        &copy; {new Date().getFullYear()} Astra Labs. Одод бичигдсэн хувь тавилан.
      </div>
    </footer>
  );
}

function FooterLinks({ links, onLinkClick, title }: { links: { name: string; id: string }[]; onLinkClick: (id: string) => void; title: string }) {
  return (
    <div>
      <h4 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">{title}</h4>
      <ul className="space-y-3">
        {links.map(link => (
          <li key={link.id}>
            <button onClick={() => onLinkClick(link.id)} className="text-left text-xs uppercase tracking-widest text-slate-500 transition-colors hover:text-indigo-400">
              {link.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
