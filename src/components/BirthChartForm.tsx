
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ZODIAC_SIGNS, SIGN_NAMES_MN } from '../types';
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, User, Check, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  onSave: (profile: UserProfile) => void;
}

export default function BirthChartForm({ onSave }: Props) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    sunSign: 'Aries'
  });

  const [errors, setErrors] = useState<{ name?: string; birthDate?: string; birthLocation?: string; birthTime?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; birthDate?: boolean; birthLocation?: boolean; birthTime?: boolean }>({});
  const [isValid, setIsValid] = useState(false);

  const validate = (name: string, value: string) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) error = 'Нэрээ оруулна уу';
      else if (value.length < 2) error = 'Нэр хэт богино байна (хамгийн багадаа 2 тэмдэгт)';
      else if (value.length > 50) error = 'Нэр хэт урт байна';
    }
    if (name === 'birthDate') {
      if (!value) error = 'Төрсөн огноогоо сонгоно уу';
      else {
        const date = new Date(value);
        const now = new Date();
        if (isNaN(date.getTime())) error = 'Буруу огноо байна';
        else if (date > now) error = 'Ирээдүйд төрөх боломжгүй';
        else if (date < new Date('1900-01-01')) error = 'Огноо хэт эрт байна';
      }
    }
    if (name === 'birthTime') {
      if (!value) error = 'Төрсөн цагаа оруулна уу';
      else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) {
        error = 'Цаг буруу форматтай байна (HH:MM)';
      }
    }
    if (name === 'birthLocation') {
      if (!value) error = 'Төрсөн газраа оруулна уу';
      else {
        if (value.trim().length < 5) error = 'Байршлын нэр хэт богино байна';
        else if (!value.includes(',')) error = 'Хот болон Улсыг таслалаар зааглаж оруулна уу (Жишээ: Улаанбаатар, Монгол)';
      }
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  useEffect(() => {
    const nameErr = validate('name', formData.name || '');
    const dateErr = validate('birthDate', formData.birthDate || '');
    const timeErr = validate('birthTime', formData.birthTime || '');
    const locErr = validate('birthLocation', formData.birthLocation || '');
    
    setIsValid(!nameErr && !dateErr && !timeErr && !locErr && !!formData.name && !!formData.birthDate && !!formData.birthTime && !!formData.birthLocation);
  }, [formData.name, formData.birthDate, formData.birthTime, formData.birthLocation]);

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validate(name, (formData as any)[name]);
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validate(name, value);
    if (name !== 'birthTime' && name !== 'sunSign') {
       setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validate('name', formData.name || '');
    const dateErr = validate('birthDate', formData.birthDate || '');
    const timeErr = validate('birthTime', formData.birthTime || '');
    const locErr = validate('birthLocation', formData.birthLocation || '');
    
    setTouched({ name: true, birthDate: true, birthLocation: true, birthTime: true });

    if (!nameErr && !dateErr && !timeErr && !locErr && 
        formData.name && formData.birthDate && formData.birthTime && formData.birthLocation && formData.sunSign) {
      onSave(formData as UserProfile);
    }
  };

  const getInputFieldClasses = (name: keyof typeof touched) => {
    const base = "w-full bg-slate-950/50 border rounded-xl px-12 py-3 focus:outline-none transition-all duration-300 text-white";
    if (!touched[name]) return `${base} border-white/10 focus:border-indigo-500/50`;
    if (errors[name as keyof typeof errors]) return `${base} border-rose-500/50 focus:border-rose-500 bg-rose-500/5`;
    return `${base} border-emerald-500/50 focus:border-emerald-500 bg-emerald-500/5`;
  };

  const progress = [
    formData.name ? 1 : 0,
    formData.birthDate ? 1 : 0,
    formData.birthTime ? 1 : 0,
    formData.birthLocation ? 1 : 0,
  ].reduce((a, b) => a + b, 0) / 4 * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 md:p-10 max-w-xl mx-auto border-white/10 bg-slate-900/40 relative overflow-hidden"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        />
      </div>

      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-serif text-white mb-3">Хувийн Ордын Зураглал</h2>
        <p className="text-xs md:text-sm font-sans text-slate-500 font-light max-w-sm mx-auto leading-relaxed">
          Сансрын биетүүдийн танд өгөх зөвлөгөөг авахын тулд мэдээллээ үнэн зөв оруулна уу.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8" noValidate>
        {/* Name Field */}
        <div className="relative">
          <label htmlFor="name" className="block text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-3 ml-1 font-mono font-bold flex items-center justify-between">
            Таны Нэр
            {touched.name && !errors.name && formData.name && <Check size={12} className="text-emerald-500" />}
          </label>
          <div className="relative group">
            <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${touched.name && errors.name ? 'text-rose-500' : touched.name && !errors.name ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-indigo-400'}`} />
            <input
              id="name"
              type="text"
              placeholder="Жишээ: Ану"
              aria-invalid={!!(touched.name && errors.name)}
              aria-describedby={touched.name && errors.name ? "name-error" : undefined}
              className={getInputFieldClasses('name')}
              value={formData.name}
              onBlur={() => handleBlur('name')}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {touched.name && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {errors.name ? <AlertCircle size={16} className="text-rose-500 animate-pulse" /> : <Check size={16} className="text-emerald-500" />}
              </div>
            )}
          </div>
          <AnimatePresence>
            {touched.name && errors.name && (
              <motion.p 
                id="name-error" 
                initial={{ opacity: 0, height: 0, y: -10 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="text-[10px] text-rose-500 mt-2 ml-1 font-mono flex items-center gap-1"
              >
                <AlertCircle size={10} /> {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label htmlFor="birthDate" className="block text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-3 ml-1 font-mono font-bold flex items-center justify-between">
              Төрсөн Огноо
              {touched.birthDate && !errors.birthDate && formData.birthDate && <Check size={12} className="text-emerald-500" />}
            </label>
            <div className="relative group">
              <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${touched.birthDate && errors.birthDate ? 'text-rose-500' : touched.birthDate && !errors.birthDate ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-indigo-400'}`} />
              <input
                id="birthDate"
                type="date"
                aria-invalid={!!(touched.birthDate && errors.birthDate)}
                aria-describedby={touched.birthDate && errors.birthDate ? "date-error" : undefined}
                className={getInputFieldClasses('birthDate')}
                value={formData.birthDate}
                onBlur={() => handleBlur('birthDate')}
                onChange={(e) => handleChange('birthDate', e.target.value)}
              />
              {touched.birthDate && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {errors.birthDate ? <AlertCircle size={16} className="text-rose-500 animate-pulse" /> : <Check size={16} className="text-emerald-500" />}
                </div>
              )}
            </div>
            <AnimatePresence>
              {touched.birthDate && errors.birthDate && (
                <motion.p 
                  id="date-error" 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: 'auto', y: 0 }} 
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="text-[10px] text-rose-500 mt-2 ml-1 font-mono flex items-center gap-1"
                >
                  <AlertCircle size={10} /> {errors.birthDate}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <label htmlFor="birthTime" className="block text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-3 ml-1 font-mono font-bold flex items-center justify-between">
              Төрсөн Цаг <span className="text-indigo-400/50 italic">(Нарийвчлал)</span>
              {touched.birthTime && !errors.birthTime && formData.birthTime && <Check size={12} className="text-emerald-500" />}
            </label>
            <div className="relative group">
              <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${touched.birthTime && errors.birthTime ? 'text-rose-500' : touched.birthTime && !errors.birthTime && formData.birthTime ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-indigo-400'}`} />
              <input
                id="birthTime"
                type="time"
                className={getInputFieldClasses('birthTime' as any)}
                value={formData.birthTime}
                onBlur={() => handleBlur('birthTime')}
                onChange={(e) => handleChange('birthTime', e.target.value)}
              />
              {touched.birthTime && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {errors.birthTime ? <AlertCircle size={16} className="text-rose-500 animate-pulse" /> : <Check size={16} className="text-emerald-500" />}
                </div>
              )}
            </div>
            <AnimatePresence>
              {touched.birthTime && errors.birthTime && (
                <motion.p 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: 'auto', y: 0 }} 
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="text-[10px] text-rose-500 mt-2 ml-1 font-mono flex items-center gap-1"
                >
                  <AlertCircle size={10} /> {errors.birthTime}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sign & Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3 ml-1 font-mono font-bold">Таны Орд</label>
            <div className="relative group">
              <select
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-colors text-white appearance-none cursor-pointer"
                value={formData.sunSign}
                onChange={(e) => handleChange('sunSign', e.target.value)}
              >
                {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{SIGN_NAMES_MN[s] || s}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-focus-within:text-indigo-400">
                <Calendar size={14} />
              </div>
            </div>
          </div>
          
          <div className="relative">
            <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3 ml-1 font-mono font-bold flex items-center justify-between">
              Төрсөн Газар
              {touched.birthLocation && !errors.birthLocation && formData.birthLocation && <Check size={12} className="text-emerald-500" />}
            </label>
            <div className="relative group">
              <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${touched.birthLocation && errors.birthLocation ? 'text-rose-500' : touched.birthLocation && !errors.birthLocation && formData.birthLocation ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-indigo-400'}`} />
              <input
                type="text"
                placeholder="Хот, Улс"
                className={getInputFieldClasses('birthLocation')}
                value={formData.birthLocation}
                onBlur={() => handleBlur('birthLocation')}
                onChange={(e) => handleChange('birthLocation', e.target.value)}
              />
              {touched.birthLocation && formData.birthLocation && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {errors.birthLocation ? <AlertCircle size={16} className="text-rose-500 animate-pulse" /> : <Check size={16} className="text-emerald-500" />}
                </div>
              )}
            </div>
            <AnimatePresence>
              {touched.birthLocation && errors.birthLocation && (
                <motion.p 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: 'auto', y: 0 }} 
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="text-[10px] text-rose-500 mt-2 ml-1 font-mono"
                >
                  {errors.birthLocation}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.button
          type="submit"
          whileHover={isValid ? { scale: 1.02 } : {}}
          whileTap={isValid ? { scale: 0.98 } : {}}
          disabled={!isValid}
          className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isValid ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}
        >
          {isValid ? (
            <>
              <Sparkles size={16} className="animate-pulse" />
              ЗУРАГЛАЛ ГАРГАХ
            </>
          ) : (
            'Мэдээллээ бүрэн оруулна уу'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
