
import React from 'react';
import { motion } from 'motion/react';
import { ZodiacSign, ZODIAC_SIGNS, SIGN_NAMES_MN } from '../types';
import { Sun, Moon, Navigation } from 'lucide-react';

interface Props {
  sunSign: string;
  moonSign: string;
  risingSign?: string;
}

export default function ZodiacWheel({ sunSign, moonSign, risingSign }: Props) {
  const getAngle = (sign: string) => {
    // Standard zodiac order starting from Aries at 0 degrees
    // (Aries is usually at the 9 o'clock position in traditional charts, but we'll normalize to 0 = Top)
    const index = ZODIAC_SIGNS.findIndex(s => s.toLowerCase() === sign.toLowerCase());
    if (index === -1) return 0;
    return (index * 30) - 90; // -90 to start Aries at the top or appropriate offset
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
          
          return (
            <div 
              key={sign}
              className="absolute text-[8px] font-bold text-slate-600 uppercase tracking-tighter"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {SIGN_NAMES_MN[sign].slice(0, 3)}
            </div>
          );
        })}

        {/* Inner Grid/Circles */}
        <div className="absolute inset-[15%] border border-indigo-500/10 rounded-full" />
        <div className="absolute inset-[30%] border border-indigo-500/5 rounded-full" />
        
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
