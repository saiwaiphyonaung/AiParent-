
import React from 'react';

interface SpinnerProps {
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ text = "Generating advice..." }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full animate-pulse bg-sky-500"></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-sky-500" style={{animationDelay: '0.2s'}}></div>
        <div className="w-4 h-4 rounded-full animate-pulse bg-sky-500" style={{animationDelay: '0.4s'}}></div>
        <span className="ml-2 text-slate-500">{text}</span>
    </div>
  );
};