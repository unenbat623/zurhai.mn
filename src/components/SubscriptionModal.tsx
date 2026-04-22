
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Star, Shield, Zap, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function SubscriptionModal({ isOpen, onClose, onUpgrade }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative glass-card border-indigo-500/20 p-8 max-w-4xl w-full bg-slate-900"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-12">
              <div className="inline-block p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
                <Star size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif sleek-glow text-white mb-2 tracking-tight">Astra <span className="text-indigo-400">Plus</span> рүү сайжруулах</h2>
              <p className="text-slate-400 font-sans">Ертөнц болон хувь тавилангийн гүн нууцуудыг нээгээрэй.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Премиум Боломжууд</h3>
                <FeatureItem icon={<Star size={18} />} title="Хязгааргүй Зураглал" description="Хэний ч хамаагүй төрсөн ордыг хязгааргүй тайлж унших." />
                <FeatureItem icon={<Shield size={18} />} title="Тохирооны Шинжилгээ" description="Ямар ч хоёр ордын хоорондох харилцааг шинжлэх." />
                <FeatureItem icon={<Zap size={18} />} title="Өдөр тутмын Мэдэгдэл" description="Одод танд ашигтайгаар байрлах үед мэдэгдэл авах." />
                <FeatureItem icon={<Landmark size={18} />} title="Санхүүгийн Урьдчилсан Таамаг" description="Хөгжил цэцэглэлт, эд баялагт зориулсан тусгай мөчлөгүүд." />
              </div>

              <div className="flex flex-col justify-between bg-white/5 border border-white/5 rounded-3xl p-10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-3xl"></div>
                <div className="text-center relative z-10">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-black text-indigo-400">Сар Бүрийн Эрх</span>
                  <div className="flex items-center justify-center gap-1 mt-6">
                    <span className="text-5xl font-bold text-white">$9.99</span>
                    <span className="text-slate-500">/сар</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 font-medium">Хүссэн үедээ цуцлах боломжтой</p>
                </div>

                <div className="mt-12 space-y-4 relative z-10">
                  <button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/create-checkout-session', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                        });
                        const data = await response.json();
                        if (data.url) {
                          window.location.href = data.url;
                        } else {
                          alert('Төлбөрийн систем түр саатлаа. Дараа дахин оролдоно уу.');
                        }
                      } catch (e) {
                         console.error(e);
                         alert('Алдаа гарлаа.');
                      }
                    }}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-xs"
                  >
                    <CreditCard size={18} />
                    7 ХОНОГИЙН ҮНЭГҮЙ ТУРШИЛТ (STIPE)
                  </button>
                  <p className="text-[10px] text-center text-slate-600 px-8 uppercase leading-relaxed font-bold tracking-tighter">
                    Захиалснаар та манай үйлчилгээний нөхцөлийг зөвшөөрч байна. Хэзээ ч цуцлах боломжтой.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 text-astra-gold">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-white/90 mb-1 tracking-wide">{title}</h4>
        <p className="text-xs text-white/40 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Landmark({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polygon points="12 2 20 7 4 7 12 2" />
    </svg>
  );
}
