
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Star, Navigation, ShieldCheck, UserPlus, ChevronRight, ChevronLeft, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStartProfile: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Astra-д тавтай морил',
    description: 'Одод таны амьдралын замыг хэрхэн гэрэлтүүлж байгааг нээх аялалаа эхлүүлье.',
    icon: <Sparkles className="w-12 h-12 text-indigo-400" />,
    color: 'from-indigo-500/20 to-purple-500/20'
  },
  {
    id: 'horoscope',
    title: 'Өдрийн зурхай',
    description: 'Гариг эрхсийн өдөр тутмын хөдөлгөөн таны ажил, хайр дурлал, санхүүд хэрхэн нөлөөлөхийг мэдэж аваарай.',
    icon: <Star className="w-12 h-12 text-astra-gold" />,
    color: 'from-amber-500/10 to-orange-500/10'
  },
  {
    id: 'chart',
    title: 'Хувийн зурлагын тайлал',
    description: 'Таны төрөх үед одод ямар байрлалтай байсныг судалж, таны хувь тавилангийн нууц кодыг тайлна.',
    icon: <Navigation className="w-12 h-12 text-emerald-400" />,
    color: 'from-emerald-500/10 to-teal-500/10'
  },
  {
    id: 'premium',
    title: 'Премиум Онцлогууд',
    description: 'Тарот зөвлөгөө, нарийвчилсан тохироо болон ид шидийн дэлгүүрт нэвтрэх эрхээ нээгээрэй.',
    icon: <ShieldCheck className="w-12 h-12 text-indigo-500" />,
    color: 'from-indigo-600/10 to-blue-600/10'
  },
  {
    id: 'profile',
    title: 'Аялалаа эхлүүлье',
    description: 'Өөрийн хувийн зурхайг үзэхийн тулд профайлаа бүтээнэ үү. Энэ нь ердөө хэдхэн секунд зарцуулна.',
    icon: <UserPlus className="w-12 h-12 text-white" />,
    color: 'from-slate-500/10 to-slate-950/10'
  }
];

export default function OnboardingModal({ isOpen, onClose, onStartProfile }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onStartProfile();
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-xl sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card relative w-full max-w-[calc(100vw-24px)] overflow-hidden border-white/10 bg-slate-900 shadow-2xl shadow-black/50 sm:max-w-lg"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-10 text-slate-500 transition-colors hover:text-white sm:right-6 sm:top-6"
        >
          <X size={20} />
        </button>

        <div className={`bg-gradient-to-br p-6 sm:p-12 ${step.color} transition-colors duration-1000`}>
          <div className="flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.8 }}
                className="relative mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 sm:mb-10 sm:p-6"
              >
                <div className="absolute inset-0 bg-white/5 blur-xl rounded-full animate-pulse" />
                <div className="relative z-10">{step.icon}</div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id + '-text'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="font-serif text-2xl tracking-tight text-white sm:text-3xl">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-sans">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-white/5 p-5 sm:p-8">
          {/* Progress Indicators */}
          <div className="flex gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentStep ? 'w-8 bg-indigo-500' : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className={`mt-2 flex w-full items-center gap-3 sm:mt-4 ${currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
            <button
              onClick={handleBack}
              className={`flex min-w-0 items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-all sm:gap-2 ${
                currentStep === 0 ? 'hidden' : 'text-slate-500 hover:text-white'
              }`}
            >
              <ChevronLeft size={14} />
              Буцах
            </button>

            <button
              onClick={handleNext}
              className="group flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-black transition-all hover:bg-astra-gold sm:px-8"
            >
              {currentStep === STEPS.length - 1 ? 'Эхлүүлэх' : 'Дараах'}
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
