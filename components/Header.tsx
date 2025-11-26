import React from 'react';
import { BabyIcon } from './IconComponents';

interface HeaderProps {
  currentLang: string;
  languages: { id: string, label: string }[];
  onLangChange: (langId: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentLang, languages, onLangChange }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <BabyIcon className="h-8 w-8 text-rose-500 mr-2" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Ai<span className="text-rose-500">Parent</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {languages.map(lang => (
              <button
                key={lang.id}
                onClick={() => onLangChange(lang.id)}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  currentLang === lang.id 
                    ? 'text-rose-600' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};