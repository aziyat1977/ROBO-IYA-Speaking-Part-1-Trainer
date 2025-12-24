import React from 'react';
import { FeedbackResult } from '../utils/ieltsLogic';

interface Props {
    data: FeedbackResult | null;
    mediaUrl: string | null;
    onDownload: () => void;
    onClose: () => void;
}

export const FeedbackReport: React.FC<Props> = ({ data, mediaUrl, onDownload, onClose }) => {
    if (!data) return null;

    // Helper to render transcript with highlighting
    const renderTranscript = () => {
        const text = data.transcript || "No speech detected...";
        const words = text.split(' ');
        
        return words.map((word, idx) => {
            const cleanWord = word.replace(/[.,!?]/g, '').toLowerCase();
            
            // Check for mistakes
            const mistake = data.mistakes.find(m => m.text.toLowerCase().includes(cleanWord) && m.type !== 'fluency');
            
            // Check for advanced vocab
            const isAdvanced = data.criteria.lr.advancedWordsUsed.includes(cleanWord);

            if (mistake) {
                return (
                    <span key={idx} className="inline-block mx-0.5 relative group cursor-help text-red-600 font-semibold decoration-red-400 underline underline-offset-2 decoration-wavy">
                        {word}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-red-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {mistake.issue}
                        </span>
                    </span>
                );
            }

            if (isAdvanced) {
                return (
                    <span key={idx} className="inline-block mx-0.5 text-emerald-600 font-bold border-b-2 border-emerald-200">
                        {word}
                    </span>
                );
            }

            return <span key={idx} className="inline-block mx-0.5">{word}</span>;
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
                
                {/* Header */}
                <div className="p-8 border-b border-gray-200 dark:border-gray-800 flex justify-between items-start bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                    <div>
                        <h2 className="text-sm font-bold tracking-[0.2em] text-gray-500 uppercase mb-2">IELTS Examiner Report</h2>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Session Analysis</h1>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-black text-brand-600 dark:text-brand-400">{data.overallBand}</div>
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Overall Band</div>
                    </div>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-gray-950/50">
                    <ScoreCard title="Fluency & Coherence" score={data.criteria.fc.score} sub={`Speed: ${data.criteria.fc.wpm} WPM`} color="blue" />
                    <ScoreCard title="Lexical Resource" score={data.criteria.lr.score} sub={`${data.criteria.lr.advancedWordsUsed.length} Advanced Words`} color="emerald" />
                    <ScoreCard title="Grammar Range" score={data.criteria.gra.score} sub={`${data.criteria.gra.complexStructures.length} Complex Structs`} color="purple" />
                    <ScoreCard title="Pronunciation" score={data.criteria.p.score} sub="Est. Clarity" color="amber" />
                </div>

                {/* Detailed Analysis */}
                <div className="p-8 space-y-8">
                    
                    {/* Replay & Transcript */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-2xl">📝</span> Smart Transcript
                            </h3>
                            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl text-lg leading-relaxed text-gray-700 dark:text-gray-300 font-serif h-64 overflow-y-auto custom-scrollbar border border-gray-200 dark:border-gray-700">
                                {renderTranscript()}
                            </div>
                            <div className="mt-2 text-xs text-gray-400 flex gap-4">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Mistake/Weakness</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Advanced Vocab</span>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-2xl">▶️</span> Replay Session
                            </h3>
                             <div className="bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-gray-800 shadow-inner">
                                {mediaUrl ? (
                                    <video src={mediaUrl} controls className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-500">Recording not available</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Surgical Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-red-500 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Detailed Issues
                            </h3>
                            {data.mistakes.length === 0 ? (
                                <p className="text-green-600 italic">No major algorithmic errors detected. Good job!</p>
                            ) : (
                                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {data.mistakes.map((m, i) => (
                                        <li key={i} className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border-l-4 border-red-500">
                                            <div className="flex justify-between items-start">
                                                <span className="block text-xs font-bold uppercase text-red-500 mb-1">{m.type}</span>
                                            </div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">"{m.text}"</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{m.issue}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4 text-brand-500 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Examiner's Notes
                            </h3>
                            <div className="space-y-3">
                                <Note label="Vocabulary" text={data.criteria.lr.feedback} />
                                {data.criteria.lr.advancedWordsUsed.length > 0 && (
                                     <div className="flex flex-wrap gap-2 mt-2">
                                        {data.criteria.lr.advancedWordsUsed.map(w => (
                                            <span key={w} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-bold">{w}</span>
                                        ))}
                                     </div>
                                )}
                                <Note label="Grammar" text={data.criteria.gra.feedback} />
                                <Note label="Fluency" text={data.criteria.fc.feedback} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-between gap-4 bg-gray-50 dark:bg-gray-900">
                     <button
                        onClick={onDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download Recording
                     </button>

                     <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
                     >
                        Close & New Session
                     </button>
                </div>

            </div>
        </div>
    );
};

const ScoreCard = ({ title, score, sub, color }: any) => {
    const colorClasses: any = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200',
        purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200',
        amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200',
    };

    return (
        <div className={`p-4 rounded-2xl border ${colorClasses[color]} flex flex-col items-center justify-center text-center`}>
            <div className={`text-3xl font-black mb-1 ${colorClasses[color].split(' ')[0]}`}>{score}</div>
            <div className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-1">{title}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{sub}</div>
        </div>
    );
};

const Note = ({ label, text }: any) => (
    <div className="flex gap-3 items-start">
        <span className="font-bold text-xs uppercase text-gray-400 mt-1 w-20 flex-shrink-0">{label}</span>
        <span className="text-gray-700 dark:text-gray-300 text-sm">{text}</span>
    </div>
);