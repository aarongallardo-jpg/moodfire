'use client';

import { motion } from 'motion/react';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  if (streak === 0) return null;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full group"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut" 
        }}
      >
        <Flame size={14} className="text-orange-500 fill-orange-500" />
      </motion.div>
      <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wider">
        {streak} {streak === 1 ? 'Día' : 'Días'}
      </span>
    </motion.div>
  );
}
