
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ZODIAC_SIGNS, SIGN_NAMES_MN } from '../types';
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, User, Check, AlertCircle, Sparkles, Mail, Search, Loader2 } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface Props {
  onSave: (profile: UserProfile) => void;
}

export default function BirthChartForm({ onSave }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
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
  
  // Google Maps Integration State
  const [locationSuggestions, setLocationSuggestions] = useState<{formatted_address: string, place_id: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load saved form data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('astra_form_draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.warn("Could not load form draft", e);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('astra_form_draft', JSON.stringify(formData));
  }, [formData]);

  const validate = (name: string, value: string) => {
    let error = '';
    if (name === 'name') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) error = 'И-мейл хаягаа оруулна уу';
      else if (!emailRegex.test(value)) error = 'Буруу и-мейл хаяг байна (Жишээ: name@example.com)';
      else if (value.length > 100) error = 'И-мейл хэт урт байна';
    }
    if (name === 'birthDate') {
      if (!value) error = 'Төрсөн огноогоо сонгоно уу';
      else {
        const date = new Date(value);
        const now = new Date();
        const minDate = new Date();
        minDate.setFullYear(now.getFullYear() - 120);
        
        if (isNaN(date.getTime())) error = 'Буруу огноо байна';
        else if (date > now) error = 'Ирээдүйд төрөх боломжгүй';
        else if (date < minDate) error = 'Огноо хэт эрт байна (120 жилээс дээш)';
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
        if (value.trim().length < 3) error = 'Байршлын нэр хэт богино байна';
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

    // Handle Google Maps Search
    if (name === 'birthLocation' && GOOGLE_MAPS_API_KEY) {
      if (value.length > 2) {
        debouncedFetch(value);
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedFetch = (query: string) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      fetchGeocoding(query);
    }, 500);
    setDebounceTimer(timer);
  };

  const fetchGeocoding = async (query: string) => {
    if (!GOOGLE_MAPS_API_KEY) return;
    setIsSearching(true);
    try {
      // Using Geocoding API as requested
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`);
      const data = await response.json();
      if (data.status === 'OK') {
        const results = data.results.map((r: any) => ({
          formatted_address: r.formatted_address,
          place_id: r.place_id
        }));
        setLocationSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Geocoding fetch failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSuggestion = (address: string) => {
    setFormData(prev => ({ ...prev, birthLocation: address }));
    setShowSuggestions(false);
    validate('birthLocation', address);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const err = validate('name', formData.name || '');
      setTouched(prev => ({ ...prev, name: true }));
      if (!err && formData.name) setCurrentStep(2);
    } else if (currentStep === 2) {
      const dErr = validate('birthDate', formData.birthDate || '');
      const tErr = validate('birthTime', formData.birthTime || '');
      setTouched(prev => ({ ...prev, birthDate: true, birthTime: true }));
      if (!dErr && !tErr && formData.birthDate && formData.birthTime) setCurrentStep(3);
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(1, prev - 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      localStorage.removeItem('astra_form_draft');
      onSave(formData as UserProfile);
    }
  };

  const getInputFieldClasses = (name: keyof typeof touched) => {
    const base = "w-full bg-slate-950/50 border rounded-xl px-12 py-3 focus:outline-none transition-all duration-300 text-white";
    if (!touched[name]) return `${base} border-white/10 focus:border-indigo-500/50`;
    if (errors[name as keyof typeof errors]) return `${base} border-rose-500/50 focus:border-rose-500 bg-rose-500/5`;
    return `${base} border-emerald-500/50 focus:border-emerald-500 bg-emerald-500/5`;
  };

  const stepProgress = (currentStep / 3) * 100;

  const stepLabels = ['Үндсэн', 'Цаг хугацаа', 'Байршил'];

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
          animate={{ width: `${stepProgress}%` }}
          className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
        />
      </div>

      <div className="text-center mb-10 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-indigo-500/10 rounded-full -z-10 animate-[pulse_6s_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-indigo-500/5 rounded-full -z-10" />
        <h2 className="text-3xl md:text-3xl font-serif text-white mb-6 tracking-tight">Сансрын Хөтөч</h2>
        
        {/* Visual Stepper */}
        <div className="flex items-center justify-between max-w-[280px] mx-auto mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 -z-10" />
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            
            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-500 ${
                  isActive ? 'bg-indigo-600 border-indigo-500 text-white scale-110 shadow-lg shadow-indigo-600/30' : 
                  isCompleted ? 'bg-emerald-500 border-emerald-400 text-white' : 
                  'bg-slate-900 border-white/10 text-slate-500'
                }`}>
                  {isCompleted ? <Check size={14} /> : stepNum}
                </div>
                <span className={`text-[8px] uppercase tracking-tighter transition-colors duration-500 ${
                  isActive ? 'text-indigo-400 font-bold' : 'text-slate-600'
                }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs font-sans text-slate-500 font-light max-w-sm mx-auto leading-relaxed uppercase tracking-widest hidden md:block">
          {currentStep === 1 ? 'Оддын зураглал гаргахад таны мэдээлэл чухал.' : currentStep === 2 ? 'Төрсөн агшин бол сансар огторгуйн дардас юм.' : 'Одон орны байршил таны хувь тавиланг тодорхойлно.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8" noValidate>
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-3 ml-1 font-mono font-bold flex items-center justify-between">
                  И-мейл хаяг
                  {touched.name && !errors.name && formData.name && <Check size={12} className="text-emerald-500" />}
                </label>
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${touched.name && errors.name ? 'text-rose-500' : touched.name && !errors.name && formData.name ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-indigo-400'}`} />
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    className={getInputFieldClasses('name')}
                    value={formData.name}
                    onBlur={() => handleBlur('name')}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                  {touched.name && formData.name && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {errors.name ? <AlertCircle size={16} className="text-rose-500 animate-pulse" /> : <Check size={16} className="text-emerald-500" />}
                    </div>
                  )}
                </div>
                <ErrorMsg touched={touched.name} error={errors.name} />
              </div>

              <div className="relative">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3 ml-1 font-mono font-bold">Таны Орд</label>
                <div className="relative group">
                  <select
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/50 transition-colors text-white appearance-none cursor-pointer"
                    value={formData.sunSign}
                    onChange={(e) => handleChange('sunSign', e.target.value)}
                  >
                    {ZODIAC_SIGNS.map(s => <option key={s} value={s}>{SIGN_NAMES_MN[s] || s}</option>)}
                  </select>
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 group-focus-within:text-indigo-400" size={14} />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-3 ml-1 font-mono font-bold flex items-center justify-between">
                  Төрсөн Огноо
                </label>
                <div className="relative group">
                  <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${touched.birthDate && errors.birthDate ? 'text-rose-500' : touched.birthDate && !errors.birthDate && formData.birthDate ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-indigo-400'}`} />
                  <input
                    type="date"
                    className={getInputFieldClasses('birthDate')}
                    value={formData.birthDate}
                    onBlur={() => handleBlur('birthDate')}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                  />
                  {touched.birthDate && formData.birthDate && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {errors.birthDate ? <AlertCircle size={16} className="text-rose-500 animate-pulse" /> : <Check size={16} className="text-emerald-500" />}
                    </div>
                  )}
                </div>
                <ErrorMsg touched={touched.birthDate} error={errors.birthDate} />
              </div>
              
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-400 mb-3 ml-1 font-mono font-bold flex items-center justify-between">
                  Төрсөн Цаг
                </label>
                <div className="relative group">
                  <Clock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${touched.birthTime && errors.birthTime ? 'text-rose-500' : touched.birthTime && !errors.birthTime && formData.birthTime ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-indigo-400'}`} />
                  <input
                    type="time"
                    className={getInputFieldClasses('birthTime' as any)}
                    value={formData.birthTime}
                    onBlur={() => handleBlur('birthTime')}
                    onChange={(e) => handleChange('birthTime', e.target.value)}
                  />
                  {touched.birthTime && formData.birthTime && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {errors.birthTime ? <AlertCircle size={16} className="text-rose-500 animate-pulse" /> : <Check size={16} className="text-emerald-500" />}
                    </div>
                  )}
                </div>
                <ErrorMsg touched={touched.birthTime} error={errors.birthTime} />
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-3 ml-1 font-mono font-bold flex items-center justify-between">
                  Төрсөн Газар
                  {GOOGLE_MAPS_API_KEY && <span className="text-[8px] text-slate-600 flex items-center gap-1"><Search size={8} /> Google Maps</span>}
                </label>
                <div className="relative group">
                  <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${touched.birthLocation && errors.birthLocation ? 'text-rose-500' : touched.birthLocation && !errors.birthLocation && formData.birthLocation ? 'text-emerald-500' : 'text-slate-600 group-focus-within:text-indigo-400'}`} />
                  <input
                    type="text"
                    placeholder="Хот, Улс (Улаанбаатар, Монгол)"
                    className={getInputFieldClasses('birthLocation')}
                    value={formData.birthLocation}
                    onBlur={() => handleBlur('birthLocation')}
                    onChange={(e) => handleChange('birthLocation', e.target.value)}
                    autoComplete="off"
                  />
                  
                  {isSearching && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      <Loader2 size={16} className="text-indigo-400 animate-spin" />
                    </div>
                  )}

                  {touched.birthLocation && formData.birthLocation && !isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {errors.birthLocation ? <AlertCircle size={16} className="text-rose-500 animate-pulse" /> : <Check size={16} className="text-emerald-500" />}
                    </div>
                  )}

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && locationSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                      >
                        {locationSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.place_id}
                            type="button"
                            onClick={() => selectSuggestion(suggestion.formatted_address)}
                            className="w-full text-left px-4 py-3 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2 border-b border-white/5 last:border-0"
                          >
                            <MapPin size={12} className="text-indigo-400" />
                            {suggestion.formatted_address}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <ErrorMsg touched={touched.birthLocation} error={errors.birthLocation} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 pt-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 py-4 rounded-xl border border-white/5 bg-white/5 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              Буцах
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-[2] py-4 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
            >
              Үргэлжлүүлэх
            </button>
          ) : (
            <motion.button
              type="submit"
              whileHover={isValid ? { scale: 1.02 } : {}}
              whileTap={isValid ? { scale: 0.98 } : {}}
              disabled={!isValid}
              className={`flex-[2] font-bold py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isValid ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'}`}
            >
              <Sparkles size={16} className={isValid ? "animate-pulse" : ""} />
              ЗУРАГЛАЛ ГАРГАХ
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
}

function ErrorMsg({ touched, error }: { touched?: boolean, error?: string }) {
  return (
    <AnimatePresence>
      {touched && error && (
        <motion.p 
          initial={{ opacity: 0, height: 0, y: -10 }} 
          animate={{ opacity: 1, height: 'auto', y: 0 }} 
          exit={{ opacity: 0, height: 0, y: -10 }}
          className="text-[10px] text-rose-500 mt-2 ml-1 font-mono flex items-center gap-1"
        >
          <AlertCircle size={10} /> {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
