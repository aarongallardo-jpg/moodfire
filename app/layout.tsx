import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'MOODFIRE',
  description: 'Tu diario de estado de ánimo diario.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased selection:bg-primary selection:text-black" suppressHydrationWarning>{children}</body>
    </html>
  );
}
