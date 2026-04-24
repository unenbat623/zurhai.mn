
import React from 'react';
import { motion } from 'motion/react';
import { ZodiacSign, ZODIAC_SIGNS, SIGN_NAMES_MN } from '../types';
import { Sun, Moon, Navigation, Flame, Mountain, Wind, Droplets } from 'lucide-react';

interface Props {
  sunSign: string;
  moonSign: string;
  risingSign?: string;
}

const SIGN_INFO: Record<ZodiacSign, { element: 'Fire' | 'Earth' | 'Air' | 'Water', modality: 'Cardinal' | 'Fixed' | 'Mutable' }> = {
  'Aries': { element: 'Fire', modality: 'Cardinal' },
  'Taurus': { element: 'Earth', modality: 'Fixed' },
  'Gemini': { element: 'Air', modality: 'Mutable' },
  'Cancer': { element: 'Water', modality: 'Cardinal' },
  'Leo': { element: 'Fire', modality: 'Fixed' },
  'Virgo': { element: 'Earth', modality: 'Mutable' },
  'Libra': { element: 'Air', modality: 'Cardinal' },
  'Scorpio': { element: 'Water', modality: 'Fixed' },
  'Sagittarius': { element: 'Fire', modality: 'Mutable' },
  'Capricorn': { element: 'Earth', modality: 'Cardinal' },
  'Aquarius': { element: 'Air', modality: 'Fixed' },
  'Pisces': { element: 'Water', modality: 'Mutable' }
};

const ELEMENT_STYLES = {
  Fire: { color: 'text-orange-500', bg: 'bg-orange-500/10', icon: <Flame size={8} /> },
  Earth: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: <Mountain size={8} /> },
  Air: { color: 'text-sky-400', bg: 'bg-sky-400/10', icon: <Wind size={8} /> },
  Water: { color: 'text-indigo-400', bg: 'bg-indigo-400/10', icon: <Droplets size={8} /> }
};

const MODALITY_LABELS = {
  Cardinal: 'C',
  Fixed: 'F',
  Mutable: 'M'
};

export default function ZodiacWheel({ sunSign, moonSign, risingSign }: Props) {
  const getAngle = (sign: string) => {
    // Standard zodiac order starting from Aries at 0 degrees
    const index = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === sign.toLowerCase());
    if (index === -1) return 0;
    return (index * 30) - 90; 
  };

  const sunAngle = getAngle(sunSign);
  const moonAngle = getAngle(moonSign);
  const risingAngle = risingSign ? getAngle(risingSign) : null;

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-indigo-500/5 blur-[100px] rounded-full" />
      
      {/* The Wheel */}
      <div className="absolute inset-0 border-[1px] border-indigo-500/20 rounded-full">
        {/* Zodiac Segments */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = (i * 30) - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 42 * Math.cos(rad);
          const y = 50 + 42 * Math.sin(rad);
          
          const info = SIGN_INFO[sign];
          const style = ELEMENT_STYLES[info.element];
          
          return (
            <div 
              key={sign}
              className="absolute flex flex-col items-center gap-0.5 group"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* Element Icon and Modality Label */}
              <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded-full ${style.bg} ${style.color} scale-75 opacity-60 group-hover:opacity-100 transition-opacity`}>
                {style.icon}
                <span className="text-[5px] font-bold leading-none">{MODALITY_LABELS[info.modality]}</span>
              </div>
              
              <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter group-hover:text-slate-200 transition-colors">
                {SIGN_NAMES_MN[sign].slice(0, 3)}
              </div>
            </div>
          );
        })}

        {/* Inner Grid/Circles */}
        <div className="absolute inset-[18%] border border-indigo-500/10 rounded-full" />
        <div className="absolute inset-[32%] border border-indigo-500/5 rounded-full" />
        
        {/* Planet Markers */}
        <PlanetMarker angle={sunAngle} color="text-amber-400" icon={<Sun size={14} />} label="Наран" />
        <PlanetMarker angle={moonAngle} color="text-blue-400" icon={<Moon size={14} />} label="Саран" />
        {risingAngle !== null && (
          <PlanetMarker angle={risingAngle} color="text-emerald-400" icon={<Navigation size={14} />} label="Мандах" />
        )}

        {/* Center Sparkle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full blur-[2px] opacity-20" />
        </div>
      </div>
    </div>
  );
}

function PlanetMarker({ angle, color, icon, label }: { angle: number, color: string, icon: React.ReactNode, label: string }) {
  const rad = (angle * Math.PI) / 180;
  // Position planet between circles
  const x = 50 + 28 * Math.cos(rad);
  const y = 50 + 28 * Math.sin(rad);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className={`absolute ${color} flex flex-col items-center gap-1`}
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <div className="p-2 bg-slate-900 rounded-full border border-white/10 shadow-lg shadow-black/50">
        {icon}
      </div>
      <span className="text-[6px] uppercase font-bold tracking-widest whitespace-nowrap bg-black/40 px-1 rounded">
        {label}
      </span>
      {/* Line to center */}
      <div 
        className="absolute w-px h-16 bg-gradient-to-t from-transparent via-current to-transparent opacity-20 -z-10 origin-top"
        style={{ transform: `rotate(${angle + 90}deg)`, top: '50%' }}
      />
    </motion.div>
  );
}
