'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import MoodForm from '@/components/MoodForm';
import { getEntries, saveEntry } from '@/lib/storage';
import { MoodEntry } from '@/lib/types';
import { LogIn, LogOut, Cloud, HardDrive, Loader2 } from 'lucide-react';
import { auth, loginWithGoogle, logout, syncCloudData, saveCloudEntry } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [entries, setEntries] = useState<Record<string, MoodEntry>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    const initApp = async () => {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      setSelectedDate(`${y}-${m}-${d}`);
      
      const localData = getEntries();
      setEntries(localData);
      setIsLoaded(true);

      if (auth) {
        onAuthStateChanged(auth, async (currentUser) => {
          setUser(currentUser);
          if (currentUser) {
            setIsSyncing(true);
            try {
              const mergedData = await syncCloudData(currentUser.uid, getEntries());
              setEntries(mergedData);
              // Update local with cloud data so they stay in sync
              Object.values(mergedData).forEach(entry => saveEntry(entry));
              setSyncError('');
            } catch (e: any) {
              setSyncError('Error de sincronización. Trabajando en modo local.');
            } finally {
              setIsSyncing(false);
            }
          }
        });
      }
    };
    initApp();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      alert(error.message || "Error al iniciar sesión");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleSaveEntry = async (entry: MoodEntry) => {
    // 1. Save locally first (optimistic update)
    const updatedEntries = saveEntry(entry);
    setEntries(updatedEntries);

    // 2. Save to cloud if logged in
    if (user) {
      try {
        await saveCloudEntry(user.uid, entry);
        setSyncError('');
      } catch (e: any) {
        console.error(e);
        setSyncError('No se pudo guardar en la nube. Se guardó localmente.');
      }
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-12 bg-surface-container-low border-b border-outline sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <h1 className="font-headline italic text-2xl text-primary tracking-tight">MOODFIRE</h1>
          
          <div className="ml-4 flex items-center gap-2 border border-outline px-3 py-1 rounded-full bg-surface">
            {user ? (
               isSyncing ? (
                 <Loader2 size={12} className="text-on-surface-variant animate-spin" />
               ) : syncError ? (
                 <Cloud size={12} className="text-mood-awful" />
               ) : (
                 <Cloud size={12} className="text-mood-great" />
               )
            ) : (
               <HardDrive size={12} className="text-on-surface-variant" />
            )}
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
              {user ? (isSyncing ? 'Sincronizando' : syncError ? 'Local (Error)' : 'Nube') : 'Local'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {!user ? (
            <>
              <span className="text-xs font-medium text-on-surface-variant hidden md:inline-block">
                Inicia sesión con Google para guardar tu historial en la nube
              </span>
              <button onClick={handleLogin} className="flex items-center gap-2 bg-surface border border-outline hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-semibold text-xs transition-colors">
                <LogIn size={16} />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
               {user.photoURL && (
                 <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-outline hidden sm:block" />
               )}
               <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-semibold text-primary">{user.displayName || 'Usuario'}</span>
                  <span className="text-[10px] text-on-surface-variant">{user.email}</span>
               </div>
               <button onClick={handleLogout} className="flex items-center gap-2 bg-surface border border-outline hover:bg-surface-container-high text-on-surface px-4 py-2 rounded-lg font-semibold text-xs transition-colors ml-2">
                <LogOut size={16} />
                <span className="hidden lg:inline">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row gap-8 p-6 lg:p-12 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Calendar */}
        <section className="flex-1 lg:w-2/3 xl:w-3/4">
          <Calendar 
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            entries={entries}
          />

          {/* Decorative / Creative Element below calendar */}
          <div className="mt-12 p-6 bg-surface rounded-xl border border-outline relative overflow-hidden hidden md:block">
            <span className="text-[10px] uppercase tracking-widest text-primary mb-3 block">Consejo Diario</span>
            <h3 className="font-headline text-xl mb-2 text-white font-light">El calor de tus días</h3>
            <p className="text-on-surface-variant text-[13px] max-w-md leading-relaxed">
              La consistencia es la clave. Registra tu estado de ánimo diariamente para descubrir patrones y mantener viva la llama de tu bienestar emocional.
            </p>
          </div>
        </section>

        {/* Right Column: Form */}
        <section className="w-full lg:w-[400px] xl:w-[450px] shrink-0">
          <MoodForm 
            selectedDate={selectedDate}
            initialData={entries[selectedDate]}
            onSave={handleSaveEntry}
          />
        </section>

      </main>
    </div>
  );
}
