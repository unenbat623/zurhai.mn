
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, Sparkles, Star, Target, Info, Download, Loader2 } from 'lucide-react';
import { NumerologyData, UserProfile } from '../types';
import { fetchNumerology } from '../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  userProfile: UserProfile | null;
}

export default function NumerologyView({ userProfile }: Props) {
  const [data, setData] = useState<NumerologyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current || !data) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#0f172a', // Matches slate-900 for PDF consistency
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Numerology_Report_${userProfile?.name}.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('PDF татахад алдаа гарлаа.');
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (userProfile?.birthDate && userProfile?.name) {
      loadNumerology(userProfile.name, userProfile.birthDate);
    }
  }, [userProfile?.birthDate, userProfile?.name]);

  const loadNumerology = async (name: string, date: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchNumerology(name, date);
      setData(result);
    } catch (err: any) {
      console.error(err);
      if (err.message === 'QUOTA_EXCEEDED') {
        setError('QUOTA_EXCEEDED');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="text-center py-24 glass-card border-white/5 bg-slate-900/40 max-w-2xl mx-auto">
        <Info size={48} className="mx-auto text-indigo-500 mb-6 opacity-40" />
        <h3 className="text-2xl font-light text-white mb-4 italic">Профайл Шаардлагатай</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Тоон зурхайг үзэхийн тулд "Зурхай" таб дээр өөрийн мэдээллээ оруулна уу.</p>
      </div>
    );
  }

  if (error === 'QUOTA_EXCEEDED') {
    return (
      <div className="text-center py-24 glass-card border-indigo-500/30 bg-indigo-500/5 max-w-2xl mx-auto">
        <Sparkles size={48} className="mx-auto text-astra-gold mb-6 animate-pulse" />
        <h3 className="text-2xl font-serif text-white mb-4 italic">Сансрын энерги цэнэг авч байна</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">Тоон зурхайн энерги түр хугацаанд саатлаа. Оддын энерги дахин боловсруулагдах хүртэл хүлээгээд дахин оролдоно уу.</p>
        <button 
          onClick={() => loadNumerology(userProfile.name, userProfile.birthDate)}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
        >
          Дахин оролдох
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-card min-h-[400px] max-w-3xl mx-auto">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Hash className="w-12 h-12 text-indigo-400 opacity-50" />
        </motion.div>
        <p className="mt-6 text-white/60 font-sans italic animate-pulse">Таны нэр болон огнооны тоон энергийг тооцоолж байна...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="flex justify-end">
        <button
          onClick={handleExportPDF}
          disabled={exporting || !data}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {exporting ? 'ТАТАЖ БАЙНА...' : 'PDF ТАТАХ'}
        </button>
      </div>
      <AnimatePresence mode="wait">
        {data && (
          <motion.div
            ref={reportRef}
            key="numerology-result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 bg-gradient-to-br from-indigo-950/40 to-slate-950 border-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 mb-4 relative group-hover:scale-110 transition-transform duration-500">
                  <span className="text-5xl font-serif font-bold text-white sleek-glow">{data.lifePathNumber}</span>
                  <div className="absolute -inset-2 border border-indigo-500/20 rounded-full animate-ping opacity-10" />
                </div>
                <h3 className="text-[9px] uppercase font-bold tracking-[0.3em] text-indigo-400 mb-1">Амьдралын Зам</h3>
                <p className="text-[10px] text-slate-500 font-mono">Life Path</p>
              </div>

              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-500/10 border-2 border-purple-500/30 mb-4 relative group-hover:scale-110 transition-transform duration-500">
                  <span className="text-5xl font-serif font-bold text-white sleek-glow">{data.destinyNumber}</span>
                  <div className="absolute -inset-2 border border-purple-500/20 rounded-full animate-ping opacity-10" style={{ animationDelay: '0.5s' }} />
                </div>
                <h3 className="text-[9px] uppercase font-bold tracking-[0.3em] text-purple-400 mb-1">Хувь Тавилан</h3>
                <p className="text-[10px] text-slate-500 font-mono">Destiny Number</p>
              </div>
            </div>

            <div className="space-y-8 mb-12">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.2em] text-indigo-400 mb-2 flex items-center gap-2">
                   <Hash size={12} /> Амьдралын Замын Утга
                </h5>
                <p className="text-sm text-slate-300 leading-relaxed">{data.lifePathMeaning}</p>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.2em] text-purple-400 mb-2 flex items-center gap-2">
                   <Target size={12} /> Нэрний Нууц Утга
                </h5>
                <p className="text-sm text-slate-300 leading-relaxed">{data.destinyMeaning}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 flex items-center gap-2">
                  <Star size={14} className="text-indigo-400" />
                  Хувийн Шижиг
                </h5>
                <div className="flex flex-wrap gap-2">
                  {data.traits.map((trait, i) => (
                    <span key={i} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[11px] text-indigo-300 font-medium">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500 flex items-center gap-2">
                  <Sparkles size={14} className="text-astra-gold" />
                  Сансрын Зөвлөгөө
                </h5>
                <p className="text-sm text-slate-400 leading-relaxed italic">
                  "{data.cosmicAdvise}"
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-astra-gold" />
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Astra AI Numerology Engine</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NumerologyInfoCard 
          icon={<Hash className="text-indigo-400" />}
          title="Тооны Хурд"
          desc="Таны төрсөн огноо нь орчлон ертөнцтэй ямар тоон давтамжаар холбогддог болохыг илэрхийлнэ."
        />
        <NumerologyInfoCard 
          icon={<Star className="text-purple-400" />}
          title="Нөөц Боломж"
          desc="Таны амьдралын замын тоо нь танд заяагдсан байгалийн авьяас чадвар, хүчийг зааж өгдөг."
        />
        <NumerologyInfoCard 
          icon={<Target className="text-emerald-400" />}
          title="Зам Мөр"
          desc="Энэхүү тоо нь таныг амьдралдаа ямар зорилго тавьж, ямар замаар явах ёстойг гэрэлтүүлнэ."
        />
      </div>
    </div>
  );
}

function NumerologyInfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass-card p-8 bg-slate-900/40 border-white/5 space-y-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
        {icon}
      </div>
      <h6 className="text-[10px] uppercase font-bold tracking-widest text-white">{title}</h6>
      <p className="text-[10px] text-slate-500 leading-relaxed font-light">{desc}</p>
    </div>
  );
}
