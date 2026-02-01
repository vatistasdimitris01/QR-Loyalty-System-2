import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BackButton, FlagLogo } from './common';

interface InfoLayoutProps {
  title: string;
  category: string;
  children: React.ReactNode;
}

export const InfoLayout: React.FC<InfoLayoutProps> = ({ title, category, children }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-white font-sans text-[#163a24]">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 py-5">
          <div className="flex items-center gap-8">
            <BackButton />
            <div className="flex items-center gap-3">
              <FlagLogo className="w-8 h-8" />
              <h2 className="text-xl font-bold font-display tracking-tighter text-[#163a24]">QROYAL</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'el' : 'en')}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4c9a66] hover:text-[#2bee6c] transition-all"
            >
              {language === 'en' ? 'EL' : 'EN'}
            </button>
            <a href="/signup/business" className="hidden sm:block bg-[#163a24] text-[#2bee6c] px-6 py-2.5 rounded-xl text-xs font-black active:scale-95 transition-all">
              Build Now
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
            <span className="text-[9px] font-black tracking-[0.3em] text-[#4c9a66] uppercase">{category}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tighter leading-none">{title}</h1>
        </div>

        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:font-bold prose-p:text-slate-500 prose-p:leading-relaxed prose-strong:text-[#163a24] prose-code:text-[#2bee6c] prose-code:bg-slate-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
          {children}
        </div>
        
        <div className="mt-32 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-1 text-center md:text-left">
                <p className="text-xs font-bold text-slate-400">Need deep integration support?</p>
                <p className="text-sm font-medium text-[#163a24]">Our engineers are available for architecture reviews.</p>
            </div>
            <a href="mailto:vatistasdim.dev@icloud.com" className="bg-[#2bee6c] text-[#163a24] px-8 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all">
                Contact Technical Team
            </a>
        </div>
      </main>

      <footer className="bg-slate-50/50 py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">© QRoyal Infrastructure | Enterprise Tier</p>
      </footer>
    </div>
  );
};