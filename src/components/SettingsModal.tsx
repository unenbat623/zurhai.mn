
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Bell, Shield, Moon, LogOut, Save, Check, Zap, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { UserProfile, SIGN_NAMES_MN, ZODIAC_SIGNS } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
  isPremium: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function SettingsModal({ isOpen, onClose, userProfile, onUpdateProfile, isPremium, error, onRetry }: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'energy'>('profile');
  const [formData, setFormData] = useState<Partial<UserProfile>>(userProfile || {});
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    if (formData.name && formData.sunSign) {
      onUpdateProfile(formData as UserProfile);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl h-full md:h-[600px] glass-card overflow-hidden bg-slate-900 border-white/10 shadow-2xl flex flex-col md:flex-row"
      >
        {/* Sidebar / Navigation tabs on mobile */}
        <div className="md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-4 md:p-6 flex flex-col justify-between">
          <div>
            <h3 className="hidden md:block text-xs font-bold uppercase tracking-[0.3em] text-slate-500 mb-8 ml-2">Тохиргоо</h3>
            <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              <NavButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={<User size={16} />} 
                label="Профайл" 
              />
              <NavButton 
                active={activeTab === 'notifications'} 
                onClick={() => setActiveTab('notifications')} 
                icon={<Bell size={16} />} 
                label="Мэдэгдэл" 
              />
              <NavButton 
                active={activeTab === 'privacy'} 
                onClick={() => setActiveTab('privacy')} 
                icon={<Shield size={16} />} 
                label="Нууцлал" 
              />
              <NavButton 
                active={activeTab === 'energy'} 
                onClick={() => setActiveTab('energy')} 
                icon={<Zap size={16} />} 
                label="Энерги" 
              />
            </div>
          </div>

          <button className="hidden md:flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all text-xs font-bold uppercase tracking-widest">
            <LogOut size={16} />
            Гарах
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col bg-slate-900/50 overflow-hidden">
          <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/5">
            <h2 className="text-lg md:text-xl font-serif text-white">
              {activeTab === 'profile' && 'Хувийн мэдээлэл'}
              {activeTab === 'notifications' && 'Мэдэгдлийн тохиргоо'}
              {activeTab === 'privacy' && 'Нууцлал ба Аюулгүй байдал'}
              {activeTab === 'energy' && 'Сансрын Энерги (Quota)'}
            </h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 md:p-0">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-md">
                <div className="flex items-center gap-4 mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-2xl font-serif">
                    {formData.name?.[0] || 'A'}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{formData.name || 'Хэрэглэгч'}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{formData.sunSign ? SIGN_NAMES_MN[formData.sunSign] : 'Ордоо сонгоогүй'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label="Нэр">
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-white text-sm"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Төрсөн огноо">
                      <input 
                        type="date" 
                        value={formData.birthDate || ''} 
                        onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-white text-sm"
                      />
                    </Field>
                    <Field label="Төрсөн цаг">
                      <input 
                        type="time" 
                        value={formData.birthTime || ''} 
                        onChange={e => setFormData({...formData, birthTime: e.target.value})}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-white text-sm"
                      />
                    </Field>
                  </div>

                  <Field label="Зурхайн орд">
                    <select 
                      value={formData.sunSign || 'Aries'} 
                      onChange={e => setFormData({...formData, sunSign: e.target.value as any})}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 text-white text-sm"
                    >
                      {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{SIGN_NAMES_MN[s]}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <ToggleItem 
                  title="Өдөр тутмын зурхай" 
                  desc="Өдөр бүр гариг эрхсийн нөлөөллийн талаар мэдэгдэл авах" 
                  defaultChecked={localStorage.getItem('astra_notif_daily') === 'true'}
                  onToggle={(checked) => localStorage.setItem('astra_notif_daily', String(checked))}
                />
                <ToggleItem 
                  title="Шинэ бүтээгдэхүүн" 
                  desc="Ид шидийн дэлгүүрт шинэ бараа нэмэгдэх үед мэдэгдэх" 
                  defaultChecked={localStorage.getItem('astra_notif_shop') === 'true'}
                  onToggle={(checked) => localStorage.setItem('astra_notif_shop', String(checked))}
                />
                <ToggleItem 
                  title="Сарны мөчлөг" 
                  desc="Тэргэл сар болон шинэ сарны мөчлөгт зориулсан тусгай зөвлөгөө" 
                  defaultChecked={localStorage.getItem('astra_notif_moon') !== 'false'}
                  onToggle={(checked) => localStorage.setItem('astra_notif_moon', String(checked))}
                />
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                  <div className="mt-1 text-indigo-400">
                    <Shield size={14} />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                    Remote Push Notifications-г идэвхжүүлэхийн тулд Firebase тохиргоо шаардлагатай. Одоогоор зөвхөн хөтөчийн дотоод мэдэгдлийг ашиглаж байна.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <ToggleItem 
                  title="Нийтийн профайл" 
                  desc="Таны зурхайг бусад хэрэглэгчид харах боломжтой болгох" 
                />
                <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                  <h4 className="text-white text-sm font-medium mb-2">Мэдээлэл устгах</h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">Хэрэв та өөрийн бүх өгөгдлийг устгахыг хүсвэл доорх товчийг дарна уу. Энэ үйлдэл буцахгүй.</p>
                  <button className="text-rose-500 text-[10px] uppercase font-bold tracking-widest hover:underline">Өгөгдөл устгах хүсэлт өгөх</button>
                </div>
              </div>
            )}

            {activeTab === 'energy' && (
              <div className="space-y-10">
                <div className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl italic select-none">ENERGY</div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                          <Zap size={20} className={error === 'QUOTA_EXCEEDED' ? 'text-rose-500 animate-pulse' : 'text-indigo-400'} />
                        </div>
                        <h4 className="text-xl font-serif text-white italic">Сансрын Энерги</h4>
                      </div>
                      
                      <p className="text-xs text-slate-500 mb-8 max-w-md leading-relaxed">
                        Gemini AI технологийг ашиглан таны зурлагыг тайлахад сансрын энерги шаардагддаг. 
                        Үнэгүй хувилбарт тодорхой хэмжээний хязгаар байдаг.
                      </p>
                      
                      <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest px-1">
                           <span className="text-slate-500">Системийн нөөц</span>
                           <span className={error === 'QUOTA_EXCEEDED' ? 'text-rose-500' : isPremium ? 'text-indigo-400' : 'text-astra-gold'}>
                              {error === 'QUOTA_EXCEEDED' ? 'Дууссан' : isPremium ? 'VIP Хязгааргүй' : 'Ухаалаг тооцоололт'}
                           </span>
                        </div>
                        <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-1">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: error === 'QUOTA_EXCEEDED' ? '5%' : isPremium ? '100%' : '65%' }} 
                             className={`h-full rounded-full ${error === 'QUOTA_EXCEEDED' ? 'bg-rose-600' : isPremium ? 'bg-indigo-500' : 'bg-astra-gold shadow-[0_0_10px_rgba(196,181,253,0.3)]'}`}
                           />
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-2">
                           <span>0%</span>
                           <span>100%</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                         <div className="flex items-center gap-2 text-xs">
                            <Clock size={16} className="text-indigo-400" />
                            <div className="flex flex-col">
                               <span className="text-[8px] uppercase tracking-wider text-slate-600 border-b border-indigo-500/20">Шинэчлэгдэх</span>
                               <span className="text-slate-300 font-bold">Өдөр бүр 09:00 AM</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 text-xs">
                            <RefreshCw size={16} className="text-emerald-400" />
                            <div className="flex flex-col">
                               <span className="text-[8px] uppercase tracking-wider text-slate-600 border-b border-emerald-500/20">Төлөв</span>
                               <span className={error === 'QUOTA_EXCEEDED' ? 'text-rose-500 font-bold' : 'text-emerald-400 font-bold'}>
                                 {error === 'QUOTA_EXCEEDED' ? 'Хязгаар хэтэрсэн' : 'Хэвийн'}
                               </span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {error === 'QUOTA_EXCEEDED' && (
                  <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex flex-col items-center text-center gap-4">
                     <AlertCircle size={32} className="text-rose-500 animate-pulse" />
                     <div>
                        <h5 className="text-white font-medium mb-1">Энерги Дууслаа</h5>
                        <p className="text-xs text-slate-500">Системийн өдөр тутмын хязгаар хэтэрсэн байна.</p>
                     </div>
                     <button 
                       onClick={onRetry}
                       className="px-8 py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all transition-all"
                     >
                       <RefreshCw size={14} className="inline mr-2" />
                       ОДОО ДАХИН ШАЛГАХ
                     </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-6 bg-white/5 border border-white/5 rounded-2xl">
                      <Shield size={20} className="text-indigo-400 mb-4" />
                      <h5 className="text-sm font-medium text-white mb-2 tracking-tight">API Түлхүүр</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light">Хэрэв та өөрийн API түлхүүрийг ашиглавал хязгааргүй эрхтэй болох боломжтой.</p>
                   </div>
                   <div className={`p-6 border rounded-2xl transition-all ${isPremium ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5 opacity-50'}`}>
                      <Zap size={20} className="text-astra-gold mb-4" />
                      <h5 className="text-sm font-medium text-white mb-2 tracking-tight">VIP Давуу тал</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-light">Премиум хэрэглэгчид хэзээ ч энерги дуусахгүйгээр ашиглах эрхтэй.</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSave}
              className="w-full md:w-auto px-8 py-4 md:py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-astra-gold transition-all flex items-center justify-center gap-2 group"
            >
              {showSaved ? <Check size={14} /> : <Save size={14} />}
              {showSaved ? 'Хадгалагдлаа' : 'Хадгалах'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-widest ${
        active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 ml-1 font-mono">{label}</label>
      {children}
    </div>
  );
}

function ToggleItem({ title, desc, defaultChecked = false, onToggle }: { title: string, desc: string, defaultChecked?: boolean, onToggle?: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleToggle = async () => {
    const newChecked = !checked;
    setChecked(newChecked);

    if (newChecked && title === "Өдөр тутмын зурхай") {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      }
    }

    if (onToggle) onToggle(newChecked);
  };

  return (
    <div className="flex items-center justify-between group">
      <div className="max-w-md">
        <h4 className="text-white text-sm font-medium mb-1">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
      <button 
        onClick={handleToggle}
        className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${checked ? 'bg-indigo-600' : 'bg-slate-800'}`}
      >
        <motion.div 
          animate={{ x: checked ? 24 : 0 }}
          className="w-4 h-4 bg-white rounded-full shadow-sm" 
        />
      </button>
    </div>
  );
}
