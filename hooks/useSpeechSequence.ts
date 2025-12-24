
import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechSequence = (text: string) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [available, setAvailable] = useState(false);
    const [rate, setRate] = useState(0.9);
    const synth = useRef(window.speechSynthesis);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    const loadVoices = useCallback(() => {
        const voices = synth.current.getVoices();
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

    const getTargetVoices = () => {
        const all = voicesRef.current;
        
        // Filter for British English first, then general English
        let pool = all.filter(v => v.lang.includes('GB') || v.lang.includes('UK') || v.lang === 'en-GB');
        if (pool.length === 0) pool = all.filter(v => v.lang.startsWith('en'));

        // Keywords to identify gender in voice names
        const maleKeywords = ['male', 'daniel', 'george', 'arthur', 'gordon', 'aaron', 'james'];
        const femaleKeywords = ['female', 'susan', 'hazel', 'stephanie', 'martha', 'catherine', 'samantha', 'zira', 'amy'];

        const isMale = (name: string) => maleKeywords.some(k => name.toLowerCase().includes(k));
        const isFemale = (name: string) => femaleKeywords.some(k => name.toLowerCase().includes(k));

        const males = pool.filter(v => isMale(v.name));
        const females = pool.filter(v => isFemale(v.name));
        const others = pool.filter(v => !isMale(v.name) && !isFemale(v.name));

        let voiceF1 = females[0] || others[0] || pool[0];
        let voiceM1 = males[0] || others.find(v => v !== voiceF1) || pool.find(v => v !== voiceF1) || voiceF1;
        let voiceF2 = females[1] || others.find(v => v !== voiceF1 && v !== voiceM1) || voiceF1;

        return { voiceF1, voiceM1, voiceF2 };
    };

    const speakCustom = (textToSpeak: string, voiceType: 'F1' | 'M1' | 'F2', speed: number = 0.9, pitch: number = 1.0) => {
        if (!available) return;
        synth.current.cancel(); // Stop current
        setIsPlaying(true);

        const { voiceF1, voiceM1, voiceF2 } = getTargetVoices();
        let targetVoice = voiceF1;
        
        if (voiceType === 'M1') targetVoice = voiceM1;
        else if (voiceType === 'F2') targetVoice = voiceF2;

        const u = new SpeechSynthesisUtterance(textToSpeak);
        if (targetVoice) u.voice = targetVoice;
        u.rate = speed;
        u.pitch = pitch;

        // Fallback pitch adjustments if voices are dupes
        if (voiceType === 'M1' && targetVoice === voiceF1) u.pitch = 0.7;
        if (voiceType === 'F2' && targetVoice === voiceF1) u.pitch = 1.1;

        u.onend = () => setIsPlaying(false);
        u.onerror = () => setIsPlaying(false);

        synth.current.speak(u);
    };

    const speak = () => {
        if (!text || !available) return;

        synth.current.cancel();
        setIsPlaying(true);

        const { voiceF1, voiceM1, voiceF2 } = getTargetVoices();

        const createUtterance = (voice: SpeechSynthesisVoice | undefined, txt: string, pitch: number) => {
            const u = new SpeechSynthesisUtterance(txt);
            if (voice) u.voice = voice;
            u.rate = rate; 
            u.pitch = pitch;
            return u;
        };

        const u1 = createUtterance(voiceF1, text, 1.0);
        const isFakeMale = voiceM1 === voiceF1;
        const u2 = createUtterance(voiceM1, text, isFakeMale ? 0.7 : 0.9);
        const isSameFemale = voiceF2 === voiceF1;
        const u3 = createUtterance(voiceF2, text, isSameFemale ? 1.1 : 1.0);

        u1.onend = () => {
            setTimeout(() => {
                if (synth.current.speaking || synth.current.pending) return;
                synth.current.speak(u2);
            }, 600);
        };

        u2.onend = () => {
            setTimeout(() => {
                if (synth.current.speaking || synth.current.pending) return;
                synth.current.speak(u3);
            }, 600);
        };

        u3.onend = () => {
            setIsPlaying(false);
        };

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

    useEffect(() => {
        return () => synth.current.cancel();
    }, []);

    useEffect(() => {
        stop();
    }, [text]);

    return { isPlaying, speak, stop, available, rate, setRate, speakCustom };
};
