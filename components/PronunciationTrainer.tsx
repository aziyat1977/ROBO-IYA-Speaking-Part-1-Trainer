
import React, { useState, useEffect, useRef } from 'react';
import { useSpeechSequence } from '../hooks/useSpeechSequence';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { calculateSimilarity, getWordMatchStatus } from '../utils/scoring';

interface Props {
    targetText: string;
    onPass: () => void;
}

type Stage = 'intro' | 'listen_f1' | 'user_try_1' | 'listen_m1' | 'user_try_2' | 'listen_f2' | 'user_try_final' | 'feedback';

export const PronunciationTrainer: React.FC<Props> = ({ targetText, onPass }) => {
    const [stage, setStage] = useState<Stage>('intro');
    const [score, setScore] = useState(0);
    const { speakCustom, isPlaying } = useSpeechSequence(targetText);
    const { transcript, startListening, stopListening, isListening } = useSpeechRecognition();
    const [timer, setTimer] = useState(0);
    const [currentSimilarity, setCurrentSimilarity] = useState(0);

    // Transitions
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        if (stage === 'listen_f1' && !isPlaying) timeout = setTimeout(() => setStage('user_try_1'), 500);
        else if (stage === 'listen_m1' && !isPlaying) timeout = setTimeout(() => setStage('user_try_2'), 500);
        else if (stage === 'listen_f2' && !isPlaying) timeout = setTimeout(() => setStage('user_try_final'), 500);
        return () => clearTimeout(timeout);
    }, [stage, isPlaying]);

    // Recording Logic
    useEffect(() => {
        if (stage.includes('user_try')) {
            startListening(); 
            setCurrentSimilarity(0);
            setTimer(5); 
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            const stopTimeout = setTimeout(() => {
                stopListening();
                clearInterval(interval);
                handleUserFinished();
            }, 5000);
            return () => {
                clearTimeout(stopTimeout);
                clearInterval(interval);
                stopListening();
            };
        }
    }, [stage]);

    // Real-time feedback
    useEffect(() => {
        if (stage.includes('user_try') && transcript) {
            const sim = calculateSimilarity(targetText, transcript);
            setCurrentSimilarity(sim);
        }
    }, [transcript, stage, targetText]);

    const handleUserFinished = () => {
        if (stage === 'user_try_1') setStage('listen_m1');
        else if (stage === 'user_try_2') setStage('listen_f2');
        else if (stage === 'user_try_final') {
             setTimeout(() => setStage('feedback'), 500);
        }
    };

    useEffect(() => {
        if (stage === 'listen_f1') speakCustom(targetText, 'F1', 0.8);
        if (stage === 'listen_m1') speakCustom(targetText, 'M1', 0.8, 0.9);
        if (stage === 'listen_f2') speakCustom(targetText, 'F2', 0.85);
    }, [stage]);

    useEffect(() => {
        if (stage === 'feedback') {
            const finalScore = calculateSimilarity(targetText, transcript);
            setScore(finalScore);
            if (finalScore >= 70) onPass();
        }
    }, [stage, transcript, targetText, onPass]); 

    const startTraining = () => setStage('listen_f1');
    const retry = () => { setStage('intro'); setScore(0); setCurrentSimilarity(0); };
    
    const renderTargetText = () => {
        const words = targetText.split(/\s+/);
        // Use the smart matching logic
        const matchStatus = getWordMatchStatus(targetText, transcript);
        
        return (
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 px-2">
                {words.map((word, i) => {
                     const isMatch = matchStatus[i];
                     
                     return (
                         <span key={i} 
                            className={`
                                relative px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl font-bold text-lg md:text-2xl transition-all duration-300
                                ${isMatch 
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 scale-105 shadow-md border border-emerald-200 dark:border-emerald-500/50 -translate-y-0.5' 
                                    : 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-600 border border-transparent'}
                            `}>
                             {word}
                             {isMatch && (
                                 <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 md:h-4 md:w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500 text-[8px] md:text-[10px] text-white items-center justify-center">✓</span>
                                 </span>
                             )}
                         </span>
                     );
                })}
            </div>
        );
    };

    const containerClass = `
        w-full bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 shadow-xl 
        flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 relative overflow-hidden transition-colors duration-500
        ${stage.includes('user_try') ? 'border-brand-400 ring-4 ring-brand-100 dark:ring-brand-900/30' : ''}
        min-h-[350px] md:min-h-[400px]
    `;

    // Dynamic color for the real-time feedback bar
    let barColor = 'bg-red-500';
    if (currentSimilarity > 40) barColor = 'bg-yellow-500';
    if (currentSimilarity > 70) barColor = 'bg-emerald-500';

    return (
        <div className={containerClass}>
            
            {/* Phase Indicator (Steps) */}
            <div className="absolute top-0 left-0 w-full flex h-1.5">
                {['listen_f1', 'user_try_1', 'listen_m1', 'user_try_2', 'listen_f2', 'user_try_final'].map((s, idx) => {
                    const isActive = stage === s;
                    const isPast = ['listen_f1', 'user_try_1', 'listen_m1', 'user_try_2', 'listen_f2', 'user_try_final', 'feedback'].indexOf(stage) > idx;
                    
                    return (
                        <div key={s} className="flex-1 h-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                            <div className={`absolute inset-0 transition-all duration-500 ${isActive ? 'bg-brand-500 animate-pulse' : isPast ? 'bg-brand-300 dark:bg-brand-700' : ''}`} />
                        </div>
                    )
                })}
            </div>

            {stage === 'intro' && (
                <div className="flex flex-col items-center gap-4 md:gap-6 max-w-lg">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-brand-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30 animate-bounce-gentle">
                        <span className="text-4xl md:text-6xl text-white">🎙️</span>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">Pronunciation<br/><span className="text-brand-500">Mastery</span></h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg mt-2">
                            Listen to native speakers. Repeat exactly what you hear. 
                            <br/><strong className="text-gray-800 dark:text-gray-200">70% Accuracy</strong> required to pass.
                        </p>
                    </div>
                    <button 
                        onClick={startTraining}
                        className="mt-2 px-8 py-3 md:px-12 md:py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all text-sm md:text-xl uppercase tracking-wider"
                    >
                        Start Training
                    </button>
                </div>
            )}

            {(stage === 'listen_f1' || stage === 'listen_m1' || stage === 'listen_f2') && (
                <div className="flex flex-col items-center">
                    <div className="relative mb-6 md:mb-8">
                        <div className="w-28 h-28 md:w-40 md:h-40 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-5xl md:text-7xl">👂</span>
                        </div>
                        {/* Sound waves animation */}
                        <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-[ping_2s_linear_infinite] opacity-20"></div>
                        <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-[ping_2s_linear_infinite_0.5s] opacity-20"></div>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">Listen Closely</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${stage.includes('f') ? 'bg-pink-500' : 'bg-blue-500'}`}></span>
                        <p className="text-sm md:text-lg font-bold text-gray-500 uppercase tracking-widest">
                            {stage === 'listen_f1' ? 'Female Voice A' : stage === 'listen_m1' ? 'Male Voice' : 'Female Voice B'}
                        </p>
                    </div>
                </div>
            )}

            {stage.includes('user_try') && (
                <div className="w-full flex flex-col items-center max-w-3xl">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-red-500 text-white rounded-full flex items-center justify-center shadow-red-500/50 shadow-2xl relative z-10 transition-transform duration-100 scale-105">
                             <div className="absolute inset-0 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                             <span className="text-4xl md:text-5xl font-black">{timer}</span>
                        </div>
                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                        <div className="absolute -inset-4 bg-red-500 rounded-full animate-pulse opacity-10"></div>
                    </div>
                    
                    <h3 className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-widest mb-4">Your Turn • Speak Now</h3>
                    
                    {renderTargetText()}

                    {/* Live Feedback Bar */}
                    <div className="w-full max-w-sm md:max-w-md mt-4">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">
                            <span>Accuracy</span>
                            <span className={currentSimilarity > 70 ? 'text-emerald-500' : 'text-gray-500'}>{currentSimilarity}%</span>
                        </div>
                        <div className="h-3 md:h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${barColor} transition-all duration-300 ease-out relative`}
                                style={{ width: `${currentSimilarity}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {stage === 'feedback' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl items-center">
                    <div className="flex flex-col items-center justify-center relative">
                        {/* Score Circle */}
                        <div className="relative inline-flex items-center justify-center">
                            <svg className="w-40 h-40 md:w-64 md:h-64 transform -rotate-90">
                                <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="10%" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                                <circle 
                                    cx="50%" cy="50%" r="45%" 
                                    stroke="currentColor" strokeWidth="10%" fill="transparent" 
                                    strokeDasharray={282} // approx
                                    strokeDashoffset={282 - (282 * score) / 100} 
                                    strokeLinecap="round"
                                    className={`transition-all duration-1500 ease-out ${score >= 70 ? "text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"}`} 
                                />
                            </svg>
                            <svg className="absolute w-40 h-40 md:w-64 md:h-64 transform -rotate-90" viewBox="0 0 256 256">
                               <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="20" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                               <circle 
                                    cx="128" cy="128" r="110" 
                                    stroke="currentColor" strokeWidth="20" fill="transparent" 
                                    strokeDasharray={691} 
                                    strokeDashoffset={691 - (691 * score) / 100} 
                                    strokeLinecap="round"
                                    className={`transition-all duration-1500 ease-out ${score >= 70 ? "text-emerald-500" : "text-rose-500"}`} 
                                />
                            </svg>
                            
                            <div className="absolute flex flex-col items-center">
                                <span className={`text-5xl md:text-7xl font-black ${score >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{score}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center lg:text-left space-y-4 md:space-y-6">
                        {score >= 70 ? (
                            <div className="space-y-3 md:space-y-4">
                                <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold uppercase text-[10px] md:text-xs tracking-widest mb-1">Result: Passed</div>
                                <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">Native-Level<br/>Pronunciation!</h3>
                                <p className="text-base md:text-xl text-gray-600 dark:text-gray-300">Your intonation and clarity are excellent. You are ready for the next topic.</p>
                                <button disabled className="w-full px-6 py-3 md:px-8 md:py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold rounded-2xl cursor-not-allowed border-2 border-dashed border-gray-300 dark:border-gray-700">
                                    ✓ Topic Unlocked
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 md:space-y-4">
                                <div className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full font-bold uppercase text-[10px] md:text-xs tracking-widest mb-1">Result: Try Again</div>
                                <h3 className="text-2xl md:text-4xl lg:text-5xl font-black text-rose-500 leading-tight">Almost There!</h3>
                                <p className="text-base md:text-xl text-gray-600 dark:text-gray-300">You need 70% accuracy to proceed. Focus on enunciation and pace.</p>
                                <button onClick={retry} className="w-full px-6 py-3 md:px-8 md:py-4 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-500 shadow-xl shadow-brand-500/30 hover:translate-y-[-4px] transition-all text-base md:text-lg">
                                    🔄 Retry Session
                                </button>
                            </div>
                        )}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                             <p className="text-xs font-bold text-gray-400 uppercase mb-2">Transcript</p>
                             <p className="text-sm md:text-lg italic text-gray-600 dark:text-gray-300">"{transcript || "..."}"</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
