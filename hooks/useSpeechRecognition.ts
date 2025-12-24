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
                console.error("Speech recognition error", event.error);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const startListening = () => {
        setTranscript(''); // Clear previous
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch(e) {
                console.error(e);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { transcript, isListening, startListening, stopListening };
};