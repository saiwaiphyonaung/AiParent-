import React from 'react';
import type { Topic } from '../types';

interface TopicSelectorProps {
  topics: Topic[];
  selectedTopic: Topic | null;
  onSelectTopic: (topic: Topic) => void;
  translations: { [key: string]: { title: string } };
}

const colorClasses: { [key: string]: { bg: string, text: string, ring: string } } = {
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', ring: 'focus:ring-rose-500' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', ring: 'focus:ring-amber-500' },
  indigo: { bg: 'bg-indigo-600', text: 'text-indigo-600', ring: 'focus:ring-indigo-500' },
  teal: { bg: 'bg-teal-600', text: 'text-teal-600', ring: 'focus:ring-teal-500' },
  violet: { bg: 'bg-violet-600', text: 'text-violet-600', ring: 'focus:ring-violet-500' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', ring: 'focus:ring-emerald-500' },
};

export const TopicSelector: React.FC<TopicSelectorProps> = ({ topics, selectedTopic, onSelectTopic, translations }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
      {topics.map((topic, index) => {
        const IconComponent = topic.icon;
        const isSelected = selectedTopic?.id === topic.id;
        const topicColors = colorClasses[topic.color] || colorClasses.rose;

        return (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            className={`flex flex-col items-center justify-center text-center p-4 rounded-2xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-1 animate-fadeInUp ${topicColors.ring} ${
              isSelected
                ? `${topicColors.bg} text-white shadow-lg`
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-sm'
            }`}
            style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
            aria-pressed={isSelected}
            aria-label={translations[topic.id]?.title || topic.title}
          >
            <IconComponent className={`h-8 w-8 mb-2 transition-colors ${isSelected ? 'text-white' : topicColors.text}`} />
            <span className="text-xs md:text-sm font-semibold">{translations[topic.id]?.title || topic.title}</span>
          </button>
        );
      })}
    </div>
  );
};