import React, { useState, useEffect } from 'react';
import { ALL_SLIDES } from './constants';
import { BackgroundVisual } from './components/Visuals';
import { AudioVisualizer } from './components/AudioVisualizer';
import { AudioControls } from './components/AudioControls';
import { useSpeechSequence } from './hooks/useSpeechSequence';
import { SlideType } from './types';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDark, setIsDark] = useState(true); // Default to dark mode for aesthetics
  const [isMicActive, setIsMicActive] = useState(false);
  const [direction, setDirection] = useState(0); // -1 prev, 1 next

  const currentSlide = ALL_SLIDES[currentIndex];
  const progress = ((currentIndex + 1) / ALL_SLIDES.length) * 100;
  
  // Construct text for reading: removes Q:/A:/R: prefixes for natural flow
  const fullTextToRead = `${currentSlide.text} ${currentSlide.subText ? currentSlide.subText.replace(/Q:|A:|R:/g, '') : ''}`;

  // Hoist speech state to interact with visuals
  const { isPlaying: isTeacherPlaying, speak, stop, available: isSpeechAvailable } = useSpeechSequence(fullTextToRead);
  
  const isVisualActive = isTeacherPlaying || isMicActive;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

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

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`h-full w-full flex flex-col relative overflow-hidden font-sans ${isDark ? 'dark' : ''}`}>
      
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 bg-white dark:bg-gray-900 transition-colors duration-500">
        <BackgroundVisual topic={currentSlide.topic} mode={currentSlide.visualMode} active={isVisualActive} />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900 opacity-80 pointer-events-none" />
      </div>

      {/* HEADER / NAV */}
      <header className="relative z-20 flex justify-between items-center p-4 md:p-6 backdrop-blur-sm bg-white/30 dark:bg-gray-900/30">
        <div className="flex items-center gap-3">
          <span className="text-3xl filter drop-shadow-lg">{currentSlide.topicEmoji}</span>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Topic {Math.floor(currentIndex / 3) + 1}</h1>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white leading-none">{currentSlide.topic}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white hover:scale-110 transition-transform"
            aria-label="Toggle Theme"
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
          key={currentIndex} // Trigger animation on key change
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
            <h3 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {currentSlide.text}
            </h3>
            
            {currentSlide.subText && (
              <div className="relative pl-6 border-l-4 border-brand-500 dark:border-brand-400">
                <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {currentSlide.subText}
                </p>
              </div>
            )}
          </div>
          
          {/* Interaction Zone: Audio & Mic */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-6">
              
              <AudioVisualizer isActive={isMicActive} />

              <div className="flex items-center justify-center gap-8">
                {/* Teacher Audio Button */}
                <AudioControls 
                  isPlaying={isTeacherPlaying} 
                  onToggle={() => isTeacherPlaying ? stop() : speak()} 
                  available={isSpeechAvailable} 
                />

                {/* Mic Button */}
                <button
                  onClick={() => setIsMicActive(!isMicActive)}
                  className={`
                    p-6 rounded-full transition-all duration-300 shadow-xl border-4
                    ${isMicActive 
                      ? 'bg-red-500 hover:bg-red-600 border-red-300 text-white scale-110 shadow-red-500/40' 
                      : 'bg-brand-500 hover:bg-brand-600 border-brand-300 text-white hover:scale-105 shadow-brand-500/40'}
                  `}
                  aria-label="Toggle Microphone"
                >
                   {isMicActive ? (
                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                   ) : (
                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                   )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER / CONTROLS */}
      <footer className="relative z-20 p-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-brand-500 h-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>

          {/* Nav Buttons */}
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all
                ${currentIndex === 0 
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
              disabled={currentIndex === ALL_SLIDES.length - 1}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all
                ${currentIndex === ALL_SLIDES.length - 1 
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