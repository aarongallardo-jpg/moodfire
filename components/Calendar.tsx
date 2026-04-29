'use client';

import { motion } from 'motion/react';
import { MoodEntry } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  entries: Record<string, MoodEntry>;
}

const MOOD_COLORS = {
  great: 'bg-mood-great',
  good: 'bg-mood-good',
  normal: 'bg-mood-normal',
  bad: 'bg-mood-bad',
  awful: 'bg-mood-awful',
};

export default function Calendar({ currentMonth, onMonthChange, selectedDate, onSelectDate, entries }: CalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // 0 is Sunday, 1 is Monday. We want Monday to be 0.
  let firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const formatDate = (d: number) => {
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline font-light text-3xl text-white">
            {monthNames[month]} {year}
          </h2>
          <p className="text-on-surface-variant text-[13px] mt-2">Tu progreso emocional este mes</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              onMonthChange(new Date());
              onSelectDate(todayStr);
            }}
            className="px-3 py-1.5 rounded-lg bg-surface border border-outline hover:bg-surface-container-high transition-colors text-on-surface text-[11px] font-bold uppercase tracking-widest"
          >
            Hoy
          </button>
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-lg bg-surface border border-outline hover:bg-surface-container-high transition-colors text-on-surface"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-lg bg-surface border border-outline hover:bg-surface-container-high transition-colors text-on-surface"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-4">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <div key={day} className="text-center text-on-surface-variant text-[11px] uppercase tracking-widest pb-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square rounded-lg bg-surface-container-low opacity-50"></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = formatDate(dayNum);
          const entry = entries[dateStr];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;

          return (
            <motion.button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors border
                ${isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-outline hover:bg-surface-container-high'}
                ${isToday && !isSelected ? 'border-on-surface-variant/50' : ''}
              `}
            >
              <span className={`text-sm ${isSelected || isToday ? 'font-semibold' : ''}`}>
                {dayNum}
              </span>
              
              {entry && (
                <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${MOOD_COLORS[entry.mood]}`}></div>
              )}
              
              {isToday && (
                <span className="text-[9px] text-on-surface-variant absolute top-1 uppercase tracking-widest hidden sm:block">Hoy</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
