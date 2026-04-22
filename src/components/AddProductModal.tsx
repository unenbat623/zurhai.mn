
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Image as ImageIcon, CreditCard, Loader2 } from 'lucide-react';
import { generateProductDescription } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, description: string, image: string, price: number) => void;
}

export default function AddProductModal({ isOpen, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState(25);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!name) return;
    setIsGenerating(true);
    try {
      const desc = await generateProductDescription(name);
      setDescription(desc);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    // Generate placeholder if no image URL is provided
    const finalImageUrl = imageUrl.trim() || `https://picsum.photos/seed/${encodeURIComponent(name)}/400/500`;
    
    onAdd(name, description, finalImageUrl, price);
    setName('');
    setDescription('');
    setImageUrl('');
    setPrice(25);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl glass-card p-12 overflow-hidden border-indigo-500/30 bg-slate-950"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-serif text-white tracking-widest uppercase">Бараа нэмэх</h3>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-white transition-colors flex items-center gap-2 group"
              >
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close preview</span>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3 font-mono font-bold">Бүтээгдэхүүний нэр (Заавал)</label>
                    <input
                      type="text"
                      required
                      placeholder="Жишээ: Сансрын Болор"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3 font-mono font-bold">Тайлбар</label>
                    <div className="relative">
                      <textarea
                        rows={5}
                        placeholder="Бүтээгдэхүүний дэлгэрэнгүй мэдээлэл..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-indigo-500/50 transition-colors text-white resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={!name || isGenerating}
                        className="absolute bottom-4 right-4 flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-all disabled:opacity-50"
                      >
                        {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        <span className="text-[10px] uppercase font-bold tracking-widest">generate</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3 font-mono font-bold">Зураг (URL)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <input
                        type="text"
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>
                    <p className="text-[9px] text-slate-600 mt-2 italic tracking-wider">
                      {imageUrl.trim() ? 'Appears at checkout. JPEG, PNG or WEBP under 2MB.' : 'Зургийн URL оруулахгүй бол нэр дээр тулгуурлан автоматаар зураг үүсгэнэ.'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3 font-mono font-bold">Үнэ (USD)</label>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-indigo-500/50 transition-colors text-white"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                    />
                  </div>

                  <div className="pt-4 p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-indigo-400">
                      <CreditCard size={20} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Stripe Integration</span>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600/20 rounded-full flex items-center px-1">
                      <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={!name}
                  className="flex-1 bg-white text-black hover:bg-astra-gold font-bold py-4 rounded-xl transition-all active:scale-95 uppercase tracking-widest text-[11px] disabled:opacity-50"
                >
                  Бүтээгдэхүүн нэмэх
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
