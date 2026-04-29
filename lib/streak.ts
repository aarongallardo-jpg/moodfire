import { MoodEntry } from './types';

export const calculateStreak = (entries: Record<string, MoodEntry>): number => {
    const dates = Object.keys(entries).sort().reverse();
    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If no entry today or yesterday, streak is 0
    if (!entries[today] && !entries[yesterday]) return 0;

    let streak = 0;
    let currentDate = entries[today] ? today : yesterday;

    while (entries[currentDate]) {
        streak++;
        const dateObj = new Date(currentDate + 'T12:00:00');
        dateObj.setDate(dateObj.getDate() - 1);
        currentDate = dateObj.toISOString().split('T')[0];
    }

    return streak;
};
