import React from 'react';
import { useSpeechSequence } from '../hooks/useSpeechSequence';

interface AudioControlsProps {
    text: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ text }) => {
    const { isPlaying, speak, stop, available } = useSpeechSequence(text);

    if (!available) return null;

    return (
        <button
            onClick={isPlaying ? stop : speak}
            className={`
                group relative p-4 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center
                ${isPlaying 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white scale-110 shadow-amber-500/50' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:scale-105 shadow-gray-400/30 dark:shadow-black/30 hover:bg-gray-50 dark:hover:bg-gray-600'}
            `}
            aria-label={isPlaying ? "Stop Teacher Audio" : "Play Teacher Audio"}
            title="Listen to Teachers (British Accent)"
        >
            {/* Ripple effect when playing */}
            {isPlaying && (
                <span className="absolute inset-0 rounded-full animate-ping bg-amber-400 opacity-75"></span>
            )}
            
            <div className="relative z-10">
                {isPlaying ? (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                )}
            </div>
        </button>
    );
};