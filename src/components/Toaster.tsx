
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface Props {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export default function Toaster({ toasts, removeToast }: Props) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl ${
              toast.type === 'error' 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' 
                : toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-100'
            }`}
          >
            <div className="shrink-0">
              {toast.type === 'error' && <AlertCircle size={20} className="text-rose-400" />}
              {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-400" />}
              {toast.type === 'info' && <Info size={20} className="text-indigo-400" />}
            </div>
            <p className="text-[13px] font-medium leading-relaxed flex-1">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} className="opacity-50" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
