import React from 'react';
import { LightBulbIcon, SparklesIcon } from './IconComponents';
import { Spinner } from './Spinner';
import type { QuickTip } from '../types';

interface AIQuickTipsProps {
  tip: QuickTip | null;
  isLoading: boolean;
  onGetNewTip: () => void;
  translations: {
    title: string;
    button: string;
    loading: string;
  };
}

export const AIQuickTips: React.FC<AIQuickTipsProps> = ({ tip, isLoading, onGetNewTip, translations }) => {
  return (
    <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-200/80 animate-fadeInUp" style={{ animationDelay: '400ms', opacity: 0 }}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4 p-3 rounded-full bg-amber-100">
          <LightBulbIcon className="h-7 w-7 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{translations.title}</h3>
          <p className="text-sm text-slate-500">Fast answers to common questions, powered by Gemini.</p>
        </div>
      </div>
      <div className="mt-4 pl-16 min-h-[80px] flex items-center">
        {isLoading && !tip ? (
          <Spinner text={translations.loading} />
        ) : tip ? (
          <div className={`space-y-2 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
            <p className="font-semibold text-slate-800">"{tip.question}"</p>
            <p className="text-slate-600">{tip.answer}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-4 pl-16">
        <button
          onClick={onGetNewTip}
          disabled={isLoading}
          className="flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 bg-white text-amber-600 shadow-sm border border-slate-200/80 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="h-4 w-4 mr-2" />
          {translations.button}
        </button>
      </div>
    </div>
  );
};