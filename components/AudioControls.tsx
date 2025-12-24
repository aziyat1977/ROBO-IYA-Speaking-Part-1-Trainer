import React from 'react';

interface AudioControlsProps {
    isPlaying: boolean;
    onToggle: () => void;
    available: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ isPlaying, onToggle, available }) => {
    if (!available) return null;

    return (
        <button
            onClick={onToggle}
            className={`
                group relative w-16 h-16 rounded-full transition-all duration-300 shadow-xl flex items-center justify-center border-4
                ${isPlaying 
                    ? 'bg-amber-500 hover:bg-amber-600 border-amber-300 text-white scale-110 shadow-amber-500/50' 
                    : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:scale-105 shadow-lg dark:shadow-black/40'}
            `}
            aria-label={isPlaying ? "Stop Teacher Audio" : "Play Teacher Audio"}
            title="Listen to 3 IELTS Examiners"
        >
            {isPlaying && (
                <span className="absolute inset-0 rounded-full animate-ping bg-amber-400 opacity-75"></span>
            )}
            
            <div className="relative z-10">
                {isPlaying ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.266 5.266 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                )}
            </div>
        </button>
    );
};