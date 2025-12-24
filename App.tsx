import React, { useState, useEffect } from 'react';
import { ALL_SLIDES } from './constants';
import { BackgroundVisual } from './components/Visuals';
import { AudioVisualizer } from './components/AudioVisualizer';
import { AudioControls } from './components/AudioControls';
import { FeedbackReport } from './components/FeedbackReport';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentSlide = ALL_SLIDES[currentIndex];
  const progress = ((currentIndex + 1) / ALL_SLIDES.length) * 100;
  
  const fullTextToRead = `${currentSlide.text} ${currentSlide.subText ? currentSlide.subText.replace(/Q:|A:|R:/g, '') : ''}`;

  const { isPlaying: isTeacherPlaying, speak, stop, available: isSpeechAvailable } = useSpeechSequence(fullTextToRead);
  
  // Recorder & Recognition
  const { 
    isRecording, 
    isPaused, 
    startRecording, 
    stopRecording, 
    pauseRecording, 
    resumeRecording, 
    mediaBlobUrl, 
    downloadRecording 
  } = useScreenRecorder();

  const { transcript, startListening, stopListening } = useSpeechRecognition();
  
  const isVisualActive = isTeacherPlaying || isRecording;

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRecording) { // Disable nav during recording to prevent accidents
          if (e.key === 'ArrowRight') handleNext();
          if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isRecording]);

  const handleNext = () => {
    if (currentIndex < ALL_SLIDES.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleTheme = () => setIsDark(!isDark);

  // Unified Start/Stop
  const handleMainButton = () => {
      if (isRecording) {
          // STOP ACTION
          stopRecording();
          stopListening();
          
          setIsAnalyzing(true);
          const duration = (Date.now() - recordingStartTime) / 1000;
          
          setTimeout(() => {
              const result = analyzeSpeech(transcript, duration);
              setFeedbackData(result);
              setIsAnalyzing(false);
          }, 800);
      } else {
          // START ACTION
          setRecordingStartTime(Date.now());
          setFeedbackData(null); 
          startRecording();
          startListening();
      }
  };

  // Pause/Resume
  const handlePauseButton = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isPaused) {
          resumeRecording();
          startListening(); // Resume listening (simplification: start again)
      } else {
          pauseRecording();
          stopListening(); // Pause listening
      }
  };

  const handleCloseReport = () => {
      setFeedbackData(null);
  };

  return (
    <div className={`h-full w-full flex flex-col relative overflow-hidden font-sans ${isDark ? 'dark' : ''}`}>
      
      {/* FEEDBACK MODAL */}
      {feedbackData && (
          <FeedbackReport 
              data={feedbackData} 
              mediaUrl={mediaBlobUrl} 
              onDownload={downloadRecording} 
              onClose={handleCloseReport} 
          />
      )}
      
      {/* ANALYZING OVERLAY */}
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

      {/* HEADER / NAV */}
      <header className="relative z-20 flex justify-between items-center p-4 md:p-6 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30 transition-colors duration-500">
        <div className="flex items-center gap-3">
          <span className="text-3xl filter drop-shadow-lg">{currentSlide.topicEmoji}</span>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Topic {Math.floor(currentIndex / 3) + 1}</h1>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-none transition-colors duration-300">{currentSlide.topic}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status Indicator (Purely Visual) */}
          {isRecording && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPaused ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500 animate-pulse'}`}>
                  <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                  {isPaused ? 'Paused' : 'Recording'}
              </div>
          )}

          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white hover:scale-110 transition-transform shadow-sm"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT CARD */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        <div 
          key={currentIndex} 
          className={`
            w-full max-w-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl 
            rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 
            p-8 md:p-12 transition-all duration-500 transform
            ${direction > 0 ? 'animate-[float_0.5s_ease-out]' : direction < 0 ? 'animate-[float_0.5s_ease-out]' : ''}
          `}
        >
          {/* Badge */}
          <div className="mb-6">
            <span className={`
              px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
              ${currentSlide.slideType === SlideType.Question ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : ''}
              ${currentSlide.slideType === SlideType.Answer ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
              ${currentSlide.slideType === SlideType.Reasoning ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : ''}
            `}>
              {currentSlide.slideType}
            </span>
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight transition-colors duration-300">
              {currentSlide.text}
            </h3>
            
            {currentSlide.subText && (
              <div className="relative pl-6 border-l-4 border-brand-500 dark:border-brand-400">
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed transition-colors duration-300">
                  {currentSlide.subText}
                </p>
              </div>
            )}
          </div>
          
          {/* Interaction Zone */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-6">
              
              <AudioVisualizer isActive={isRecording && !isPaused} />

              <div className="flex items-center justify-center gap-8 relative">
                
                <AudioControls 
                  isPlaying={isTeacherPlaying} 
                  onToggle={() => isTeacherPlaying ? stop() : speak()} 
                  available={isSpeechAvailable} 
                />

                {/* MAIN RECORDING CONTROL CLUSTER */}
                <div className="relative group">
                    <button
                        onClick={handleMainButton}
                        className={`
                            relative z-10 p-6 rounded-full transition-all duration-300 shadow-xl border-4
                            ${isRecording 
                            ? 'bg-red-500 hover:bg-red-600 border-red-300 text-white scale-110 shadow-red-500/40' 
                            : 'bg-brand-500 hover:bg-brand-600 border-brand-300 text-white hover:scale-105 shadow-brand-500/40'}
                        `}
                        title={isRecording ? "Stop Exam & Get Feedback" : "Start Exam Recording"}
                    >
                        {isRecording ? (
                            <div className="w-10 h-10 flex items-center justify-center">
                                {/* STOP ICON */}
                                <div className="w-6 h-6 bg-white rounded-sm"></div>
                            </div>
                        ) : (
                            // MIC ICON
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        )}
                    </button>
                    
                    {/* PAUSE BUTTON (Only visible when recording) */}
                    {isRecording && (
                        <button
                            onClick={handlePauseButton}
                            className={`
                                absolute top-1/2 -right-16 -translate-y-1/2 
                                w-12 h-12 rounded-full flex items-center justify-center
                                shadow-lg border-2 transition-all duration-300
                                ${isPaused 
                                    ? 'bg-yellow-500 border-yellow-300 text-white animate-pulse' 
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'}
                            `}
                            title={isPaused ? "Resume Recording" : "Pause Recording"}
                        >
                            {isPaused ? (
                                // PLAY ICON (RESUME)
                                <svg className="w-5 h-5 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l10 6-10 6V4z"/></svg>
                            ) : (
                                // PAUSE ICON
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"/></svg>
                            )}
                        </button>
                    )}
                </div>

              </div>
              
              {/* Transcript Preview (Live) */}
              {isRecording && (
                   <div className="text-center text-sm text-gray-500 dark:text-gray-400 h-6 overflow-hidden flex items-center justify-center gap-2">
                       {isPaused && <span className="text-yellow-500 font-bold uppercase text-xs">[Paused]</span>}
                       <span>{transcript.slice(-50) || "Listening..."}</span>
                   </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-brand-500 h-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || isRecording}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all
                ${currentIndex === 0 || isRecording
                  ? 'opacity-30 cursor-not-allowed text-gray-500' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-lg hover:translate-y-[-2px]'}
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Prev
            </button>

            <span className="text-gray-400 font-mono text-sm">
              {currentIndex + 1} / {ALL_SLIDES.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === ALL_SLIDES.length - 1 || isRecording}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all
                ${currentIndex === ALL_SLIDES.length - 1 || isRecording
                  ? 'opacity-30 cursor-not-allowed text-gray-500' 
                  : 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/30 hover:translate-y-[-2px]'}
              `}
            >
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;