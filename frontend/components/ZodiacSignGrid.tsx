
import { motion } from 'motion/react';
import { ZODIAC_SIGNS, SIGN_DATES, ZodiacSign, SIGN_NAMES_MN } from '../types';

interface Props {
  onSelect: (sign: ZodiacSign) => void;
  onHover?: (sign: ZodiacSign) => void;
  selectedSign: ZodiacSign | null;
}

export default function ZodiacSignGrid({ onSelect, onHover, selectedSign }: Props) {
  const containerVariants = {
    initial: {},
    hover: {}
  };

  const shineVariants = {
    initial: { x: '-100%', skewX: -20 },
    hover: { x: '250%' }
  };

  return (
    <div className="flex flex-col gap-6">
      {!selectedSign && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4 px-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center gap-3 self-center"
        >
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-indigo-400">
            Үргэлжлүүлэхийн тулд өөрийн ордоо сонгоно уу
          </span>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        </motion.div>
      )}
      
      <div 
        className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4"
        role="radiogroup"
        aria-label="Зурхайн орд сонгох"
      >
        {ZODIAC_SIGNS.map((sign) => (
          <motion.button
            key={sign}
            role="radio"
            aria-checked={selectedSign === sign}
            aria-label={SIGN_NAMES_MN[sign]}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            animate={!selectedSign ? {
              scale: [1, 1.02, 1],
              transition: { 
                repeat: Infinity, 
                duration: 4, 
                delay: ZODIAC_SIGNS.indexOf(sign) * 0.1 
              }
            } : { scale: 1 }}
            variants={{
            hover: {
              scale: 1.05,
              y: -10,
              transition: { type: 'spring', stiffness: 300, damping: 15 }
            },
            tap: { scale: 0.95 }
          }}
          onMouseEnter={() => onHover?.(sign)}
          onClick={() => onSelect(sign)}
          className={`relative group flex flex-col items-center justify-center p-5 rounded-3xl transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            selectedSign === sign 
              ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.2)]' 
              : 'glass-card border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60'
          } border uppercase overflow-hidden`}
        >
          {/* Subtle Background Glow on Hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/20 group-hover:to-purple-600/20 transition-all duration-700" />
          
          {/* Shine Sweep Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
            <motion.div 
              variants={shineVariants}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent h-full"
            />
          </div>

          <motion.span 
            aria-hidden="true"
            className="text-4xl mb-3 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_15px_rgba(129,140,248,0.6)] transition-all duration-300"
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            {getSignEmoji(sign)}
          </motion.span>
          
          <span className="text-[10px] font-sans font-bold tracking-[0.25em] text-white/90 relative z-10">{SIGN_NAMES_MN[sign]}</span>
          <span className="text-[8px] font-mono text-slate-500 mt-2 tracking-tighter relative z-10">{SIGN_DATES[sign]}</span>
          
          {selectedSign === sign && (
            <motion.div 
              layoutId="active-badge"
              className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-[#08080C] shadow-[0_0_10px_rgba(79,70,229,0.8)]"
            />
          )}

          {/* Particle-like shimmer on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]" />
          </div>
        </motion.button>
      ))}
      </div>
    </div>
  );
}

function getSignEmoji(sign: ZodiacSign): string {
  const emojis: Record<ZodiacSign, string> = {
    'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
    'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
    'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
  };
  return emojis[sign];
}
