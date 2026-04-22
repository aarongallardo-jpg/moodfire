export type Mood = 'great' | 'good' | 'normal' | 'bad' | 'awful';
export type Energy = 'low' | 'medium' | 'high';

export interface MoodEntry {
  date: string; // Format: YYYY-MM-DD
  mood: Mood;
  note: string;
  energy: Energy;
  word: string;
  timestamp: number;
}
