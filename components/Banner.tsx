import React from 'react';
import { SparklesIcon } from './IconComponents';

interface BannerProps {
    title: string;
    text: string;
}

export const Banner: React.FC<BannerProps> = ({ title, text }) => {
    return (
        <div className="my-8 md:my-12 p-6 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-400 shadow-lg animate-fadeIn overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-5">
                <div className="flex-shrink-0 animate-fadeInUp" style={{ animationDelay: '100ms', opacity: 0 }}>
                    <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h3 
                        className="text-lg font-bold text-white animate-fadeInUp"
                        style={{ animationDelay: '200ms', opacity: 0 }}
                    >
                        {title}
                    </h3>
                    <p 
                        className="mt-1 text-white/90 leading-relaxed animate-fadeInUp"
                        style={{ animationDelay: '300ms', opacity: 0 }}
                    >
                        {text}
                    </p>
                </div>
            </div>
        </div>
    );
};