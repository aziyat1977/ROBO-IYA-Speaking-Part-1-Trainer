
import React, { useState, useEffect, useRef } from 'react';
import { ALL_SLIDES } from './constants';
import { BackgroundVisual } from './components/Visuals';
import { AudioVisualizer } from './components/AudioVisualizer';
import { AudioControls } from './components/AudioControls';
import { FeedbackReport } from './components/FeedbackReport';
import { PronunciationTrainer } from './components/PronunciationTrainer';
import { useSpeechSequence } from './hooks/useSpeechSequence';
import { useScreenRecorder } from './hooks/useScreenRecorder';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { analyzeSpeech, FeedbackResult } from './utils/ieltsLogic';
import { SlideType } from './types';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Theme init
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) { return savedTheme === 'dark'; }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const [direction, setDirection] = useState(0); 
  const [feedbackData, setFeedbackData] = useState<FeedbackResult | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pronunciationPassed, setPronunciationPassed] = useState(false);

  // Swipe refs
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);

  const currentSlide = ALL_SLIDES[currentIndex];
  const progress = ((currentIndex + 1) / ALL_SLIDES.length) * 100;
  const fullTextToRead = `${currentSlide.text} ${currentSlide.subText ? currentSlide.subText.replace(/Q:|A:|R:/g, '') : ''}`;

  const { isPlaying: isTeacherPlaying, speak, stop, available: isSpeechAvailable, rate, setRate } = useSpeechSequence(fullTextToRead);
  const { isRecording, isPaused, startRecording, stopRecording, pauseRecording, resumeRecording, mediaBlobUrl, downloadRecording } = useScreenRecorder();
  const { transcript, startListening, stopListening } = useSpeechRecognition();
  const isVisualActive = isTeacherPlaying || isRecording;

  useEffect(() => {
    if (isDark) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } 
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDark]);

  useEffect(() => {
      if (currentSlide.slideType === SlideType.Pronunciation) setPronunciationPassed(false);
      else setPronunciationPassed(true);
  }, [currentIndex]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording && !isPaused) interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRecording) {
          if (e.key === 'ArrowRight') handleNext();
          if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isRecording, pronunciationPassed]);

  // Touch Handlers for Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null; 
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  const handleNext = () => {
    if (currentSlide.slideType === SlideType.Pronunciation && !pronunciationPassed) {
        // Optional: Shake animation or toast
        return;
    }
    if (isRecording) return; // Prevent nav while recording
    if (currentIndex < ALL_SLIDES.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (isRecording) return;
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleTheme = () => setIsDark(!isDark);

  const handleMainButton = () => {
      if (isRecording) {
          stopRecording();
          stopListening();
          setElapsedTime(0);
          setIsAnalyzing(true);
          const duration = (Date.now() - recordingStartTime) / 1000;
          setTimeout(() => {
              // Pass topic to the brain
              const result = analyzeSpeech(transcript, duration, currentSlide.topic);
              setFeedbackData(result);
              setIsAnalyzing(false);
          }, 800);
      } else {
          setRecordingStartTime(Date.now());
          setElapsedTime(0);
          setFeedbackData(null); 
          startRecording();
          startListening();
      }
  };

  const handlePauseButton = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPaused) { resumeRecording(); startListening(); } 
      else { pauseRecording(); stopListening(); }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-screen-dvh w-full flex flex-col relative overflow-hidden font-sans ${isDark ? 'dark' : ''}`}>
      
      {feedbackData && <FeedbackReport data={feedbackData} mediaUrl={mediaBlobUrl} onDownload={downloadRecording} onClose={() => setFeedbackData(null)} />}
      
      {isAnalyzing && (
          <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-500 mb-4"></div>
              <div className="text-white font-bold text-xl animate-pulse">Examiner Analyzing...</div>
          </div>
      )}

      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 bg-white dark:bg-gray-900 transition-colors duration-500">
        <BackgroundVisual topic={currentSlide.topic} mode={currentSlide.visualMode} active={isVisualActive && !isPaused} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900 opacity-80 pointer-events-none" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 flex justify-between items-center p-3 md:p-4 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 shrink-0 h-[10vh] max-h-[80px]">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-2xl md:text-4xl filter drop-shadow-lg">{currentSlide.topicEmoji}</span>
          <div className="flex flex-col">
            <h1 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Topic {Math.floor(currentIndex / 5) + 1}</h1>
            <h2 className="text-base md:text-xl font-bold text-gray-800 dark:text-white leading-none">{currentSlide.topic}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isRecording && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full shadow-md transition-colors duration-300 ${isPaused ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
                  <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">{isPaused ? 'Paused' : 'REC'}</span>
                  <span className="font-mono font-bold text-sm border-l border-current pl-2 ml-1">{formatTime(elapsedTime)}</span>
              </div>
          )}
          <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white hover:scale-110 transition-transform shadow-sm">
            {isDark ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          </button>
        </div>
      </header>

      {/* RESPONSIVE MAIN CONTAINER */}
      <main 
        className="relative z-10 flex-grow flex flex-col items-center justify-center p-4 overflow-y-auto no-scrollbar"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          key={currentIndex} 
          className={`
            w-full max-w-lg md:max-w-3xl lg:max-w-5xl
            bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl 
            rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 
            p-6 md:p-10 transition-all duration-500 transform
            flex flex-col justify-center
            min-h-[40vh] md:min-h-[50vh]
            ${direction > 0 ? 'animate-[float_0.5s_ease-out]' : direction < 0 ? 'animate-[float_0.5s_ease-out]' : ''}
          `}
        >
          {/* Top Badge */}
          <div className="mb-4 flex justify-between items-start">
            <span className={`px-2 py-1 md:px-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                currentSlide.slideType === SlideType.Question ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                currentSlide.slideType === SlideType.Answer ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                currentSlide.slideType === SlideType.Reasoning ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
            }`}>
              {currentSlide.slideType}
            </span>
            {currentSlide.slideType === SlideType.Pronunciation && (
                <div className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${pronunciationPassed ? "text-emerald-500" : "text-gray-400"}`}>{pronunciationPassed ? "✅ Passed" : "🔒 Locked"}</div>
            )}
          </div>

          {currentSlide.slideType === SlideType.Pronunciation ? (
              <div className="space-y-4 md:space-y-6">
                  <h3 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    {currentSlide.text}
                  </h3>
                  <PronunciationTrainer targetText={currentSlide.text} onPass={() => setPronunciationPassed(true)} />
              </div>
          ) : (
              <div className="flex flex-col h-full justify-between gap-6 md:gap-10">
                  <div className="space-y-4 md:space-y-6">
                    <h3 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight transition-colors duration-300 select-none">
                      {currentSlide.text}
                    </h3>
                    
                    {currentSlide.subText && (
                      <div className="relative pl-4 md:pl-6 border-l-4 border-brand-500 dark:border-brand-400">
                        <p className="text-base md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed transition-colors duration-300 select-none">
                          {currentSlide.subText}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col gap-4 md:gap-6">
                      <AudioVisualizer isActive={isRecording && !isPaused} isRecording={isRecording} />
                      <div className="flex items-center justify-center gap-6 md:gap-8 relative">
                        <AudioControls isPlaying={isTeacherPlaying} onToggle={() => isTeacherPlaying ? stop() : speak()} available={isSpeechAvailable} rate={rate} onRateChange={setRate} />
                        
                        <div className="relative group">
                            <button
                                onClick={handleMainButton}
                                className={`
                                    relative z-10 p-5 md:p-6 rounded-full transition-all duration-300 shadow-xl border-4
                                    ${isRecording ? 'bg-red-500 hover:bg-red-600 border-red-300 text-white scale-110 shadow-red-500/40' : 'bg-brand-500 hover:bg-brand-600 border-brand-300 text-white hover:scale-105 shadow-brand-500/40'}
                                `}
                            >
                                {isRecording ? <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-sm"></div> : <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                            </button>
                            
                            {isRecording && (
                                <button onClick={handlePauseButton} className={`absolute top-1/2 -right-14 md:-right-20 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-300 ${isPaused ? 'bg-yellow-500 border-yellow-300 text-white animate-pulse' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>
                                    {isPaused ? <svg className="w-4 h-4 md:w-5 md:h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l10 6-10 6V4z"/></svg> : <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/></svg>}
                                </button>
                            )}
                        </div>
                      </div>
                      
                      {isRecording && (
                           <div className="text-center text-xs text-gray-500 dark:text-gray-400 h-6 overflow-hidden flex items-center justify-center gap-2">
                               {isPaused ? <span className="text-yellow-500 font-bold uppercase text-[10px]">[Paused]</span> : <span className="animate-pulse text-red-500 font-bold text-[10px] uppercase">[Recording]</span>}
                               <span className="truncate max-w-[200px] md:max-w-xs">{transcript.slice(-30) || "Listening..."}</span>
                           </div>
                      )}
                    </div>
                  </div>
              </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 p-3 md:p-4 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-500 h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex justify-between items-center">
            <button onClick={handlePrev} disabled={currentIndex === 0 || isRecording} className={`flex items-center gap-1 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-sm md:text-base transition-all ${currentIndex === 0 || isRecording ? 'opacity-30 cursor-not-allowed text-gray-500' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg hover:translate-y-[-2px]'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Prev
            </button>
            <span className="text-gray-400 font-mono text-xs">{currentIndex + 1} / {ALL_SLIDES.length}</span>
            <button onClick={handleNext} disabled={currentIndex === ALL_SLIDES.length - 1 || isRecording} className={`flex items-center gap-1 md:gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-sm md:text-base transition-all ${currentIndex === ALL_SLIDES.length - 1 || isRecording ? 'opacity-30 cursor-not-allowed text-gray-500' : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/30 hover:translate-y-[-2px]'}`}>
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
