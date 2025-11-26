import React from 'react';
import type { AgeGroup } from '../types';

interface AgeSelectorProps {
  ageGroups: AgeGroup[];
  selectedAgeGroup: AgeGroup;
  onSelectAgeGroup: (ageGroup: AgeGroup) => void;
}

export const AgeSelector: React.FC<AgeSelectorProps> = ({ ageGroups, selectedAgeGroup, onSelectAgeGroup }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 p-3 rounded-2xl">
      {ageGroups.map((ageGroup) => (
        <button
          key={ageGroup.id}
          onClick={() => onSelectAgeGroup(ageGroup)}
          className={`px-5 py-2.5 text-sm md:text-base rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 font-semibold ${
            selectedAgeGroup.id === ageGroup.id
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          {ageGroup.label}
        </button>
      ))}
    </div>
  );
};