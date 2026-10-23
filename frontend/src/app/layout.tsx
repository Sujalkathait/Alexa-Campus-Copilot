import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alexa+ Campus Copilot — Academic Productivity Assistant',
  description: 'AI-powered campus copilot for university students. Intelligently manage coursework, deadlines, automated study schedules, and voice-assisted academic productivity.',
  keywords: ['Campus Copilot', 'Academic Assistant', 'AI Study Planner', 'Student Productivity', 'Linear SaaS'],
  authors: [{ name: 'Alexa+ Campus Copilot Team' }],
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0d14',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0d14] text-slate-100 antialiased min-h-screen selection:bg-blue-600/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
