import { Moon, Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type React from 'react';
import type { InfoModalState } from '../frontendTypes';

interface Props {
  onOpenInfo: (state: InfoModalState) => void;
}

export default function FeatureCards({ onOpenInfo }: Props) {
  return (
    <section className="mt-32 grid grid-cols-1 gap-8 md:grid-cols-3">
      <FeatureCard
        icon={<Sparkles className="text-astra-gold" />}
        title="Өдөр тутмын дамжих хөдөлгөөн"
        desc="Таны байрлалд үндэслэн гариг эрхсийн нөлөөг тооцдог."
        onClick={() => onOpenInfo({ isOpen: true, title: 'Өдөр тутмын дамжих хөдөлгөөн', type: 'astro' })}
      />
      <FeatureCard
        icon={<Moon className="text-astra-blue" />}
        title="Сарны мөчлөг"
        desc="Шинэ болон тэргэл сарны энергийг ашиглан зорилгоо тодорхойл."
        onClick={() => onOpenInfo({ isOpen: true, title: 'Сарны мөчлөг', type: 'phi' })}
      />
      <FeatureCard
        icon={<Star className="text-astra-purple" />}
        title="AI зөн совин"
        desc="Astra нь тоо, орд, сэтгэлзүйн хандлагыг нэгтгэн зөвлөгөө өгнө."
        onClick={() => onOpenInfo({ isOpen: true, title: 'AI зөн совин', type: 'help' })}
      />
    </section>
  );
}

function FeatureCard({ desc, icon, onClick, title }: { desc: string; icon: React.ReactNode; onClick?: () => void; title: string }) {
  return (
    <motion.div whileHover={{ y: -10 }} onClick={onClick} className="glass-card group cursor-pointer border-white/5 bg-slate-900/30 p-10">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 transition-transform group-hover:scale-110">
        <div className="text-indigo-400">{icon}</div>
      </div>
      <h3 className="mb-4 text-[10px] font-medium uppercase tracking-wide text-white">{title}</h3>
      <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
    </motion.div>
  );
}
