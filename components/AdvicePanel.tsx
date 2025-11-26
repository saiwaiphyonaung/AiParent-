import React, { useState, useMemo, useEffect } from 'react';
import type { Topic, HealthRecord } from '../types';
import { Spinner } from './Spinner';
import { 
  SparklesIcon, ClipboardDocumentListIcon, HeartIcon, FoodIcon, FireIcon, 
  ShieldCheckIcon, InformationCircleIcon, ChartBarIcon, BookOpenIcon, PuzzlePieceIcon,
  ChatBubbleLeftEllipsisIcon, MoonIcon, ClockIcon, LightBulbIcon, ShareIcon
} from './IconComponents';
import { GrowthChart } from './GrowthChart';

interface AdvicePanelProps {
  topic: Topic | null;
  advice: string | undefined;
  isLoading: boolean;
  onGenerate: () => void;
  onAddHealthRecord: (record: { weight: string, height: string }) => void;
  healthRecords: HealthRecord[];
  bmiAdvice?: string;
  isBmiLoading?: boolean;
  buttonText: {
    generate: string;
    regenerate: string;
    generating: string;
    addRecord: string;
    share: string;
  };
  translations: {
    weight: string;
    height: string;
    history: string;
    noHistory: string;
    date: string;
    bmi: string;
    aiTipTitle: string;
    generatingTip: string;
    whatIsBmi: string;
    bmiExplanation: string;
    chartView: string;
    listView: string;
    weightLabel: string;
    heightLabel: string;
  };
  sharingTranslations: {
    copied: string;
    shareTitle: string;
  };
  disclaimerText: string;
}

const colorClasses: { [key: string]: { bg: string, text: string, border: string, ring: string } } = {
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200/80', ring: 'focus:ring-rose-500' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200/80', ring: 'focus:ring-amber-500' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', border: 'border-indigo-200/80', ring: 'focus:ring-indigo-500' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200/80', ring: 'focus:ring-teal-500' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200/80', ring: 'focus:ring-violet-500' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200/80', ring: 'focus:ring-emerald-500' },
};

const bmiAdviceIcons: { [key: string]: React.ReactNode } = {
  ASSESSMENT: <SparklesIcon className="h-5 w-5" />,
  DIET: <FoodIcon className="h-5 w-5" />,
  ACTIVITY: <FireIcon className="h-5 w-5" />,
  GENERAL: <HeartIcon className="h-5 w-5" />,
  DISCLAIMER: <ShieldCheckIcon className="h-5 w-5" />,
};

const generalAdviceIcons: { [key: string]: React.ReactNode } = {
  SLEEP: <MoonIcon className="h-5 w-5" />,
  HYGIENE: <SparklesIcon className="h-5 w-5" />,
  PLAY: <PuzzlePieceIcon className="h-5 w-5" />,
  FOOD: <FoodIcon className="h-5 w-5" />,
  LEARNING: <BookOpenIcon className="h-5 w-5" />,
  COMMUNICATION: <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />,
  EMOTION: <HeartIcon className="h-5 w-5" />,
  SAFETY: <ShieldCheckIcon className="h-5 w-5" />,
  ROUTINE: <ClockIcon className="h-5 w-5" />,
  GENERAL: <LightBulbIcon className="h-5 w-5" />,
};

const parseBmiAdvice = (advice: string) => {
  const lines = advice.split('\n').filter(line => line.trim() !== '');
  const parsed = {
    assessment: '',
    tips: [] as { category: string, text: string }[],
    disclaimer: ''
  };

  lines.forEach(line => {
    const match = line.match(/^\[(ASSESSMENT|DIET|ACTIVITY|GENERAL|DISCLAIMER)\]\s*(.*)/);
    if (match) {
      const [, category, text] = match;
      if (category === 'ASSESSMENT') {
        parsed.assessment = text;
      } else if (category === 'DISCLAIMER') {
        parsed.disclaimer = text;
      } else {
        parsed.tips.push({ category, text });
      }
    }
  });
  return parsed;
};

const parseGeneralAdvice = (advice: string) => {
  const lines = advice.split('\n').filter(line => line.trim() !== '');
  const parsed = {
    introduction: '',
    tips: [] as { category: string, text: string }[],
    closing: ''
  };

  const hasTags = lines.some(line => /^\[([A-Z]+)\]/.test(line));

  if (hasTags) {
    lines.forEach(line => {
      const match = line.match(/^\[([A-Z]+)\]\s*(.*)/);
      if (match) {
        const [, category, text] = match;
        if (category === 'INTRODUCTION') parsed.introduction = text;
        else if (category === 'CLOSING') parsed.closing = text;
        else parsed.tips.push({ category, text });
      }
    });
  } else {
    // Fallback for untagged or error responses
    if (lines.length > 0) {
        parsed.tips = lines.map(line => ({ category: 'GENERAL', text: line.replace(/^[\*\-\d\.]+\s*/, '') }));
    }
  }

  return parsed;
};


export const AdvicePanel: React.FC<AdvicePanelProps> = ({ 
  topic, 
  advice, 
  isLoading, 
  onGenerate, 
  onAddHealthRecord, 
  healthRecords,
  bmiAdvice,
  isBmiLoading,
  buttonText,
  translations,
  sharingTranslations,
  disclaimerText,
}) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [historyView, setHistoryView] = useState<'list' | 'chart'>('list');
  const [showBmiInfo, setShowBmiInfo] = useState(false);
  const [copyStatus, setCopyStatus] = useState(false);

  const topicColors = topic ? colorClasses[topic.color] || colorClasses.rose : colorClasses.rose;

  useEffect(() => {
    if (topic?.id !== 'health') {
      setWeight('');
      setHeight('');
      setFormError(null);
    }
    setCopyStatus(false);
  }, [topic]);

  const parsedBmiAdvice = useMemo(() => bmiAdvice ? parseBmiAdvice(bmiAdvice) : null, [bmiAdvice]);
  const parsedGeneralAdvice = useMemo(() => advice ? parseGeneralAdvice(advice) : null, [advice]);
  const chartRecords = useMemo(() => [...healthRecords].reverse(), [healthRecords]);
  
  const bmiAdviceToShare = useMemo(() => {
    if (!parsedBmiAdvice) return '';
    const { assessment, tips, disclaimer } = parsedBmiAdvice;
    const formattedTips = tips.map(tip => `• ${tip.text}`).join('\n');
    return [assessment, formattedTips, disclaimer].filter(Boolean).join('\n\n');
  }, [parsedBmiAdvice]);

  const adviceToShare = useMemo(() => {
    if (!parsedGeneralAdvice) return '';
    const { introduction, tips, closing } = parsedGeneralAdvice;
    const formattedTips = tips.map(tip => `• ${tip.text}`).join('\n');
    return [introduction, formattedTips, closing].filter(Boolean).join('\n\n');
  }, [parsedGeneralAdvice]);

  const handleActionClick = () => {
    if (!topic) return;
    if (topic.id === 'health') {
      if (!weight || !height || parseFloat(weight) <= 0 || parseFloat(height) <= 0) {
        setFormError('Please enter valid weight and height.');
        return;
      }
      setFormError(null);
      onAddHealthRecord({ weight, height });
      setWeight('');
      setHeight('');
    } else {
      onGenerate();
    }
  };

  const handleShare = async (adviceText: string) => {
    if (!adviceText) return;

    const shareData = {
        title: sharingTranslations.shareTitle,
        text: adviceText,
        url: window.location.href,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Error sharing:', err);
        }
    } else {
        try {
            await navigator.clipboard.writeText(adviceText);
            setCopyStatus(true);
            setTimeout(() => setCopyStatus(false), 2000); // Hide message after 2s
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy advice.');
        }
    }
  };

  const renderHealthTracker = () => {
    const healthColors = colorClasses['emerald'];
    
    return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`weight-input`} className={`block text-sm font-medium text-slate-600`}>{translations.weight}</label>
          <input
            type="number"
            id={`weight-input`}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="5.5"
            className={`mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 ${healthColors.ring} focus:border-emerald-500 sm:text-sm`}
          />
        </div>
        <div>
          <label htmlFor={`height-input`} className={`block text-sm font-medium text-slate-600`}>{translations.height}</label>
          <input
            type="number"
            id={`height-input`}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="58"
            className={`mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 ${healthColors.ring} focus:border-emerald-500 sm:text-sm`}
          />
        </div>
      </div>
      {formError && <p className="text-sm text-red-500">{formError}</p>}
      
      {isBmiLoading && (
          <div className="flex justify-center items-center py-4">
            <Spinner text={translations.generatingTip} />
          </div>
      )}
      {parsedBmiAdvice && !isBmiLoading && (
        <div className={`p-3 border rounded-lg bg-emerald-50 border-emerald-200/80 space-y-2 animate-fadeIn`}>
            <h4 className={`text-md font-semibold flex items-center text-emerald-900`}>
              <SparklesIcon className={`h-5 w-5 mr-2 text-emerald-600`} />
              {translations.aiTipTitle}
            </h4>
            {parsedBmiAdvice.assessment && (
              <p className={`text-sm font-medium text-slate-800`}>{parsedBmiAdvice.assessment}</p>
            )}
            <ul className="space-y-1.5 text-sm">
                {parsedBmiAdvice.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                        <span className={`mr-2 flex-shrink-0 mt-0.5 text-emerald-600`}>
                          {bmiAdviceIcons[tip.category]}
                        </span>
                        <span className="text-slate-700">{tip.text}</span>
                    </li>
                ))}
            </ul>
             {parsedBmiAdvice.disclaimer && (
               <p className={`text-xs italic text-slate-500 pt-1 flex items-start`}>
                  <span className={`mr-2 flex-shrink-0 mt-0.5 text-emerald-600`}>
                    {bmiAdviceIcons.DISCLAIMER}
                  </span>
                  <span>{parsedBmiAdvice.disclaimer}</span>
               </p>
            )}
            <div className="pt-2 mt-2 border-t border-emerald-200/60 flex justify-end">
                <button
                    onClick={() => handleShare(bmiAdviceToShare)}
                    className="flex items-center text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
                    aria-label={buttonText.share}
                >
                    {copyStatus ? (
                        <span className="text-emerald-600 font-bold text-xs animate-fadeIn">{sharingTranslations.copied}</span>
                    ) : (
                        <>
                            <ShareIcon className="h-4 w-4 mr-1.5" />
                            {buttonText.share}
                        </>
                    )}
                </button>
            </div>
        </div>
      )}
      
      <div>
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <h4 className={`text-md font-semibold text-slate-800`}>{translations.history}</h4>
              <button onClick={() => setShowBmiInfo(!showBmiInfo)} className={`ml-2 text-slate-400 hover:text-emerald-600 transition-colors`}>
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
            {healthRecords.length > 0 && (
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg">
               <button onClick={() => setHistoryView('list')} className={`p-1 rounded-md transition-colors ${historyView === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}>
                  <ClipboardDocumentListIcon className="h-4 w-4" />
               </button>
               <button onClick={() => setHistoryView('chart')} className={`p-1 rounded-md transition-colors ${historyView === 'chart' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}>
                  <ChartBarIcon className="h-4 w-4" />
               </button>
            </div>
            )}
        </div>
        
        {showBmiInfo && (
            <div className={`p-3 rounded-lg text-xs mb-3 bg-slate-100 animate-fadeIn`}>
                <h5 className={`font-bold mb-1 text-slate-800`}>{translations.whatIsBmi}</h5>
                <p className="text-slate-600">{translations.bmiExplanation}</p>
            </div>
        )}

        {healthRecords.length > 0 ? (
          historyView === 'list' ? (
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {healthRecords.map(record => (
                <li key={record.id} className={`p-2 rounded-md text-sm flex justify-between items-center bg-slate-50 border border-slate-200/60`}>
                  <span className={`text-slate-600`}>{record.date}</span>
                  <span className={`text-slate-600`}>{record.weight}kg / {record.height}cm</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800`}>{translations.bmi}: {record.bmi}</span>
                </li>
              ))}
            </ul>
          ) : (
            <GrowthChart 
              records={chartRecords} 
              translations={{
                weightLabel: translations.weightLabel,
                heightLabel: translations.heightLabel,
                date: translations.date,
                bmi: translations.bmi,
              }} 
            />
          )
        ) : (
          <p className={`text-sm text-center py-4 text-slate-500`}>{translations.noHistory}</p>
        )}
      </div>
    </div>
  );
  }

  const renderAdviceCard = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      );
    }
    
    if (parsedGeneralAdvice && (parsedGeneralAdvice.introduction || parsedGeneralAdvice.tips.length > 0)) {
      return (
        <div className={`space-y-3 text-slate-700 animate-fadeIn`}>
          {parsedGeneralAdvice.introduction && <p className="font-medium text-sm text-slate-800">{parsedGeneralAdvice.introduction}</p>}
          <ul className="space-y-2.5">
            {parsedGeneralAdvice.tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className={`mr-3 flex-shrink-0 mt-1 ${topicColors.text}`}>
                  {generalAdviceIcons[tip.category] || generalAdviceIcons.GENERAL}
                </span>
                <span className="text-sm">{tip.text}</span>
              </li>
            ))}
          </ul>
          {parsedGeneralAdvice.closing && <p className="text-xs italic pt-2 text-slate-500">{parsedGeneralAdvice.closing}</p>}

          <div className="pt-3 mt-3 border-t border-slate-200/80 flex justify-end items-center">
            <button
                onClick={() => handleShare(adviceToShare)}
                className={`flex items-center text-sm font-semibold text-slate-500 hover:${topicColors.text} transition-colors`}
                aria-label={buttonText.share}
            >
                {copyStatus ? (
                    <span className={`${topicColors.text} font-bold text-xs animate-fadeIn`}>{sharingTranslations.copied}</span>
                ) : (
                    <>
                        <ShareIcon className="h-4 w-4 mr-1.5" />
                        {buttonText.share}
                    </>
                )}
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col h-full">
        <p className={`text-base text-slate-600`}>{topic?.description}</p>
        <div className={`mt-4 flex-1 flex flex-col items-center justify-center p-4 rounded-xl text-center border-2 border-dashed border-slate-300`}>
          <SparklesIcon className={`h-8 w-8 mx-auto mb-2 text-slate-300`} />
          <p className={`text-sm font-medium text-slate-500`}>
            Click "Get AI Advice" to start.
          </p>
        </div>
      </div>
    );
  };

  if (!topic) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center p-8 rounded-3xl bg-white shadow-sm border border-slate-200/80 min-h-[400px] text-center animate-fadeIn">
        <SparklesIcon className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Select a Topic Above</h3>
        <p className="mt-2 text-slate-500 max-w-sm">Choose a category to get personalized, AI-powered guidance for your child's age group.</p>
      </div>
    );
  }

  const IconComponent = topic.icon;

  return (
    <div 
      className={`mt-6 bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col p-6 min-h-[400px] animate-fadeIn`}
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 mr-4 p-3 rounded-full ${topicColors.bg}`}>
            <IconComponent className={`h-7 w-7 ${topicColors.text}`} />
        </div>
        <h3 className={`text-xl font-bold tracking-tight text-slate-900`}>{topic.title}</h3>
      </div>
      
      <div className="mt-4 flex-grow flex flex-col">
          <div className="mt-2 flex-grow flex flex-col">
            {topic.id === 'health' ? renderHealthTracker() : renderAdviceCard()}
          </div>
      </div>
      
      <div className="mt-auto pt-4">
        <p className={`text-xs text-center mb-3 px-2 text-slate-500`}>
          {disclaimerText}
        </p>
        <button
          onClick={handleActionClick}
          disabled={isLoading || isBmiLoading}
          className={`w-full px-4 py-3 text-base font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-rose-500 transition-all duration-300 disabled:bg-rose-300 disabled:cursor-not-allowed flex items-center justify-center bg-rose-600 text-white hover:bg-rose-700`}
        >
          {isLoading || isBmiLoading ? (
            buttonText.generating
          ) : (
            <>
              {topic.id === 'health' ? 
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" /> : 
                <SparklesIcon className="h-5 w-5 mr-2" />
              }
              {topic.id === 'health'
                ? buttonText.addRecord
                : (advice ? buttonText.regenerate : buttonText.generate)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};