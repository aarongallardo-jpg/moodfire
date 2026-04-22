import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, collection, Timestamp } from 'firebase/firestore';
import { MoodEntry } from './types';
import config from '../firebase-applet-config.json';

const isFirebaseConfigured = config.apiKey && config.apiKey.length > 0;

export const app = isFirebaseConfigured && !getApps().length ? initializeApp(config) : (getApps().length > 0 ? getApp() : null);
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
    if (!auth) throw new Error("Firebase no está configurado. Por favor, añade tus credenciales en firebase-applet-config.json");
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error al iniciar sesión con Google", error);
        throw error;
    }
}

export const logout = async () => {
    if (!auth) return;
    await signOut(auth);
}

export const syncCloudData = async (userId: string, localEntries: Record<string, MoodEntry>): Promise<Record<string, MoodEntry>> => {
    if (!db) return localEntries;

    try {
        const moodsRef = collection(db, 'usuarios', userId, 'moods');
        const querySnapshot = await getDocs(moodsRef);
        
        const cloudEntries: Record<string, MoodEntry> = {};
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            cloudEntries[doc.id] = {
                date: doc.id,
                mood: data.mood,
                note: data.note || '',
                energy: data.energy || 'medium',
                word: data.word || '',
                timestamp: data.timestamp || Date.now(),
            } as MoodEntry;
        });

        const mergedEntries = { ...cloudEntries };

        for (const [date, localEntry] of Object.entries(localEntries)) {
            const cloudEntry = cloudEntries[date];
            if (!cloudEntry || localEntry.timestamp > cloudEntry.timestamp) {
                await setDoc(doc(db, 'usuarios', userId, 'moods', date), {
                    ...localEntry,
                    updatedAt: Timestamp.now()
                });
                mergedEntries[date] = localEntry;
            }
        }

        return mergedEntries;
    } catch (error) {
        console.error("Error syncing to cloud:", error);
        throw error;
    }
}

export const saveCloudEntry = async (userId: string, entry: MoodEntry) => {
    if (!db) return;
    try {
        await setDoc(doc(db, 'usuarios', userId, 'moods', entry.date), {
            ...entry,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error("Error saving entry to cloud:", error);
        throw error; // Let UI handle error
    }
}
