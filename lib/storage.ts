import { MoodEntry } from './types';

const STORAGE_KEY = 'moodfire_entries';

export const getEntries = (): Record<string, MoodEntry> => {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Error reading from localStorage", e);
    return {};
  }
};

export const saveEntry = (entry: MoodEntry): Record<string, MoodEntry> => {
  const entries = getEntries();
  entries[entry.date] = entry;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Error saving to localStorage", e);
  }
  return entries;
};
export const deleteEntry = (date: string): Record<string, MoodEntry> => {
  const entries = getEntries();
  delete entries[date];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Error deleting from localStorage", e);
  }
  return entries;
};
