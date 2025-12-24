
import { useState, useEffect, useRef } from 'react';

// Declaration for TS to recognize webkitSpeechRecognition
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let finalChunk = '';
                
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        let text = event.results[i][0].transcript.trim();
                        if (text.length > 0) {
                            // Auto-formatting: Capitalize first letter
                            text = text.charAt(0).toUpperCase() + text.slice(1);
                            
                            // Heuristic: Add period if it doesn't end with punctuation
                            if (!/[.!?]$/.test(text)) {
                                text += '.';
                            }
                            finalChunk += text + ' ';
                        }
                    }
                }

                if (finalChunk) {
                    setTranscript(prev => prev + finalChunk);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === 'network') {
                    console.warn("Network error detected. If offline, ensure your OS supports offline dictation (e.g. macOS/iOS).");
                }
                // Don't stop state immediately on 'no-speech' to avoid flicker
                if (event.error !== 'no-speech') {
                    setIsListening(false);
                }
            };

            recognition.onend = () => {
                // If we didn't explicitly stop (and no error occurred), we might want to restart?
                // For now, let's just sync state.
                // setIsListening(false); // Managed by start/stop
            };

            recognitionRef.current = recognition;
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, []);

    const startListening = () => {
        setTranscript(''); // Clear previous
        if (recognitionRef.current) {
            try {
                // Check if already started to prevent error
                recognitionRef.current.start();
                setIsListening(true);
            } catch(e) {
                console.warn("Recognition already started or failed to start", e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch(e) {
                // ignore
            }
            setIsListening(false);
        }
    };

    return { transcript, isListening, startListening, stopListening };
};
