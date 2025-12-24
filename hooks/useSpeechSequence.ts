import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechSequence = (text: string) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [available, setAvailable] = useState(false);
    const synth = useRef(window.speechSynthesis);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    const loadVoices = useCallback(() => {
        let voices = synth.current.getVoices();
        if (voices.length > 0) {
            voicesRef.current = voices;
            setAvailable(true);
        }
    }, []);

    useEffect(() => {
        loadVoices();
        if (synth.current.onvoiceschanged !== undefined) {
            synth.current.onvoiceschanged = loadVoices;
        }
    }, [loadVoices]);

    // Heuristic to find British Male/Female voices
    const getTargetVoices = () => {
        const all = voicesRef.current;
        // Prioritize GB/UK, then general English
        let pool = all.filter(v => v.lang.includes('GB') || v.lang.includes('UK') || v.lang === 'en-GB');
        if (pool.length === 0) pool = all.filter(v => v.lang.startsWith('en'));

        const isMale = (name: string) => 
            name.toLowerCase().includes('male') || 
            ['daniel', 'george', 'arthur', 'gordon', 'aaron'].some(n => name.toLowerCase().includes(n));
            
        const isFemale = (name: string) => 
            name.toLowerCase().includes('female') || 
            ['susan', 'hazel', 'stephanie', 'martha', 'catherine', 'samantha', 'zira'].some(n => name.toLowerCase().includes(n));

        const males = pool.filter(v => isMale(v.name));
        const females = pool.filter(v => isFemale(v.name));
        const others = pool.filter(v => !isMale(v.name) && !isFemale(v.name));

        // Selection Logic: F1 -> M1 -> F2
        // Fallback strategy: if specific gender missing, use available pool but vary pitch
        const f1 = females[0] || others[0] || pool[0];
        const m1 = males[0] || others.find(v => v !== f1) || pool.find(v => v !== f1) || f1;
        const f2 = females[1] || others.find(v => v !== f1 && v !== m1) || f1; // Try to get a different female, else repeat f1

        return { f1, m1, f2 };
    };

    const speak = () => {
        if (!text || !available) return;

        synth.current.cancel(); // Stop anything currently playing
        setIsPlaying(true);

        const { f1, m1, f2 } = getTargetVoices();
        const utteranceSettings = {
            rate: 0.9, // Slower, clear "teacher" pace
            pitch: 1.0,
        };

        const createUtterance = (voice: SpeechSynthesisVoice | undefined, txt: string, pitchMod: number = 0) => {
            const u = new SpeechSynthesisUtterance(txt);
            if (voice) u.voice = voice;
            u.rate = utteranceSettings.rate;
            u.pitch = utteranceSettings.pitch + pitchMod;
            return u;
        };

        // Sequence: F1 -> M1 -> F2
        const u1 = createUtterance(f1, text);
        const u2 = createUtterance(m1, text, -0.1); // Slightly lower pitch for male/contrast
        const u3 = createUtterance(f2, text);

        u1.onend = () => {
             // Small pause between speakers
             setTimeout(() => {
                 if (synth.current.speaking || synth.current.pending) return; // Edge case safety
                 synth.current.speak(u2);
             }, 500);
        };

        u2.onend = () => {
            setTimeout(() => {
                if (synth.current.speaking || synth.current.pending) return;
                synth.current.speak(u3);
            }, 500);
        };

        u3.onend = () => {
            setIsPlaying(false);
        };
        
        // Handle interruptions/errors
        const handleError = () => setIsPlaying(false);
        u1.onerror = handleError;
        u2.onerror = handleError;
        u3.onerror = handleError;

        synth.current.speak(u1);
    };

    const stop = () => {
        synth.current.cancel();
        setIsPlaying(false);
    };

    // Stop audio when component unmounts or text changes
    useEffect(() => {
        return () => synth.current.cancel();
    }, []);
    
    // Stop if text changes (navigating slides)
    useEffect(() => {
        stop();
    }, [text]);

    return { isPlaying, speak, stop, available };
};