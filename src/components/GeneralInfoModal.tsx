
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Shield, HelpCircle, Compass } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: string;
}

export default function GeneralInfoModal({ isOpen, onClose, title, type }: Props) {
  const getContent = () => {
    switch (type) {
      case 'astro':
        return {
          icon: <Compass className="text-indigo-400" />,
          text: "Одон орон бол тэнгэрийн биетүүдийн хөдөлгөөнийг шинжлэх ухаан юм. Astra AI нь НАСА болон бусад нээлттэй мэдээллийн эх сурвалжийг ашиглан гариг эрхсийн байршлыг 99% нарийвчлалтай тооцдог."
        };
      case 'phi':
        return {
          icon: <Info className="text-purple-400" />,
          text: "Бидний философи бол эртний мэргэн ухааныг орчин үеийн технологитой хослуулах явдал юм. Одод бидний амьдралыг шийддэггүй, харин боломжит замуудыг гэрэлтүүлж өгдөг гэдэгт бид итгэдэг."
        };
      case 'help':
        return {
          icon: <HelpCircle className="text-emerald-400" />,
          text: "Түгээмэл асуултууд: \n1. Хянах самбар хэрхэн ажилладаг вэ? - Таны төрсөн орд болон одоогийн транзитыг харьцуулна. \n2. Төлбөр хэрхэн цуцлах вэ? - Та өөрийн профайл хэсгээс хүссэн үедээ цуцлах боломжтой."
        };
      case 'legal':
        return {
          icon: <Shield className="text-rose-400" />,
          text: "Үйлчилгээний нөхцөл: Та энэхүү аппликейшнийг ашигласнаар бидний нууцлалын бодлогыг зөвшөөрч байна. Бид таны хувийн мэдээллийг гуравдагч этгээдэд хэзээ ч худалдахгүй."
        };
      default:
        return {
          icon: <Info className="text-slate-400" />,
          text: "Мэдээлэл удахгүй шинэчлэгдэнэ."
        };
    }
  };

  const content = getContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-card p-10 overflow-hidden border-indigo-500/20 bg-slate-950"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                {content.icon}
              </div>
              
              <h3 className="text-xl font-serif text-white tracking-wide">{title}</h3>
              
              <p className="text-sm text-slate-400 leading-relaxed font-sans whitespace-pre-line">
                {content.text}
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase font-bold tracking-[0.2em] rounded-xl border border-white/10 transition-all active:scale-95"
              >
                Ойлголоо
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
