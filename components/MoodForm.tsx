'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mood, Energy, MoodEntry } from '@/lib/types';
import { Flame } from 'lucide-react';

interface MoodFormProps {
  selectedDate: string;
  initialData?: MoodEntry;
  onSave: (entry: MoodEntry) => Promise<void> | void;
  onDelete?: (date: string) => Promise<void> | void;
}

const MOODS: { id: Mood; emoji: string; label: string; color: string }[] = [
  { id: 'great', emoji: '🤩', label: 'Increíble', color: 'text-mood-great' },
  { id: 'good', emoji: '😊', label: 'Bien', color: 'text-mood-good' },
  { id: 'normal', emoji: '😐', label: 'Normal', color: 'text-mood-normal' },
  { id: 'bad', emoji: '😔', label: 'Mal', color: 'text-mood-bad' },
  { id: 'awful', emoji: '😭', label: 'Horrible', color: 'text-mood-awful' },
];

const ENERGIES: { id: Energy; label: string }[] = [
  { id: 'low', label: 'Baja' },
  { id: 'medium', label: 'Media' },
  { id: 'high', label: 'Alta' },
];

export default function MoodForm({ selectedDate, initialData, onSave, onDelete }: MoodFormProps) {
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [word, setWord] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset or populate form when selected date changes
  useEffect(() => {
    if (initialData) {
      setMood(initialData.mood);
      setNote(initialData.note || '');
      setEnergy(initialData.energy);
      setWord(initialData.word || '');
    } else {
      setMood(null);
      setNote('');
      setEnergy(null);
      setWord('');
    }
  }, [selectedDate, initialData]);

  const handleSave = async () => {
    if (!mood || !energy) return; // Basic validation

    setIsSaving(true);

    const entry: MoodEntry = {
      date: selectedDate,
      mood,
      note: note.trim(),
      energy,
      word: word.trim(),
      timestamp: Date.now(),
    };

    try {
      await onSave(entry);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !onDelete) return;
    if (confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      await onDelete(selectedDate);
    }
  };

  const formattedDate = (() => {
    // Avoid timezone shift by adding time
    const d = new Date(selectedDate + 'T12:00:00');
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    }).replace('.', '');
  })();

  const isComplete = mood !== null && energy !== null;

  return (
    <div className="bg-surface border border-outline rounded-xl p-6 sm:p-8 flex flex-col gap-8 h-full">
      <header>
        <h2 className="text-on-surface-variant text-[11px] uppercase tracking-widest mb-2">Registro Diario</h2>
        <h3 className="font-headline font-light text-2xl text-white">
          {selectedDate === new Date().toISOString().split('T')[0] ? 'Hoy es ' : ''}
          {formattedDate}
        </h3>
      </header>

      {initialData && onDelete && (
        <button 
          onClick={handleDelete}
          className="absolute top-6 right-6 text-on-surface-variant/30 hover:text-mood-awful transition-colors"
          title="Eliminar registro"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      )}

      {/* Mood Selector */}
      <div className="space-y-4 relative z-10">
        <p className="text-[12px] text-on-surface-variant">¿Cómo te sientes?</p>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {MOODS.map((m) => (
            <motion.button
              key={m.id}
              onClick={() => setMood(m.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all border
                ${mood === m.id ? 'bg-primary/10 border-primary' : 'bg-surface-container-low border-outline hover:bg-surface-container-high'}
              `}
            >
              <span className="text-2xl sm:text-3xl filter drop-shadow-sm">{m.emoji}</span>
              <span className={`text-[9px] uppercase tracking-wider ${mood === m.id ? m.color : 'text-on-surface-variant'}`}>
                {m.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Note Textarea */}
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-baseline">
          <label htmlFor="note" className="text-[12px] text-on-surface-variant">
            ¿Qué ha pasado hoy?
          </label>
          <span className="text-[11px] text-on-surface-variant/50">{note.length}/150</span>
        </div>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 150))}
          placeholder="Describe tu día en pocas palabras..."
          className="w-full bg-surface-container-low rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary min-h-[120px] text-[13px] p-4 placeholder:text-on-surface-variant/30 resize-none leading-relaxed text-on-surface outline-none transition-shadow"
        />
      </div>

      {/* Energy Selector */}
      <div className="space-y-4 relative z-10">
        <p className="text-[12px] text-on-surface-variant">Nivel de Energía</p>
        <div className="flex gap-2">
          {ENERGIES.map((e) => (
            <button
              key={e.id}
              onClick={() => setEnergy(e.id)}
              className={`
                flex-1 py-2.5 text-[12px] rounded-lg transition-all border
                ${energy === e.id ? 'bg-primary text-black border-primary font-semibold' : 'bg-surface-container-low border-outline text-on-surface-variant hover:bg-surface-container-high'}
              `}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Word Input */}
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between items-baseline">
          <label htmlFor="word" className="text-[12px] text-on-surface-variant">
            Palabra del día
          </label>
          <span className="text-[11px] text-on-surface-variant/50">{word.length}/30</span>
        </div>
        <input
          id="word"
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value.slice(0, 30))}
          placeholder="Ej: Resiliencia"
          className="w-full bg-surface-container-low rounded-lg border border-outline focus:border-primary focus:ring-1 focus:ring-primary text-[13px] p-3 text-primary placeholder:text-on-surface-variant/30 outline-none transition-shadow"
        />
      </div>

      {/* Save Button */}
      <div className="mt-auto pt-4 relative z-10">
        <motion.button
          onClick={handleSave}
          disabled={!isComplete || isSaving}
          whileTap={isComplete ? { scale: 0.98 } : {}}
          animate={isSaving ? { scale: [1, 1.02, 1], opacity: [1, 0.8, 1] } : {}}
          className={`
            w-full py-3.5 rounded-lg font-semibold text-[14px] flex items-center justify-center gap-2 transition-all
            ${isComplete
              ? 'bg-primary text-black hover:bg-primary-dim cursor-pointer'
              : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-50'}
          `}
        >
          <Flame size={18} className={isSaving ? 'animate-pulse' : ''} />
          {isSaving ? 'Guardando...' : initialData ? 'Actualizar Registro' : 'Guardar Registro'}
        </motion.button>
      </div>
    </div>
  );
}
