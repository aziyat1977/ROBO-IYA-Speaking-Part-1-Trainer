
import React, { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
    isActive: boolean;
    isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, isRecording }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Responsive Canvas Resizer
    useEffect(() => {
        const resize = () => {
            if (canvasRef.current && containerRef.current) {
                canvasRef.current.width = containerRef.current.offsetWidth;
                canvasRef.current.height = containerRef.current.offsetHeight;
            }
        };
        window.addEventListener('resize', resize);
        resize();
        return () => window.removeEventListener('resize', resize);
    }, []);

    // 1. Manage Audio Stream Lifecycle
    useEffect(() => {
        if (isRecording && !stream) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(audioStream => {
                    setStream(audioStream);
                    
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    audioContextRef.current = audioCtx;
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 64; 
                    analyserRef.current = analyser;

                    const source = audioCtx.createMediaStreamSource(audioStream);
                    source.connect(analyser);
                })
                .catch(err => console.error("Mic access denied", err));
        } else if (!isRecording && stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }
            analyserRef.current = null;
        }
    }, [isRecording]); 

    // 2. Manage Visualization Loop
    useEffect(() => {
        if (isActive && stream && analyserRef.current) {
            visualize();
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        }
    }, [isActive, stream]);

    const visualize = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!analyserRef.current || !canvasRef.current) return;
            
            animationRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                const r = barHeight + 25 * (i / bufferLength);
                const g = 250 * (i / bufferLength);
                const b = 50;

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 5);
                } else {
                    ctx.rect(x, canvas.height - barHeight, barWidth, barHeight);
                }
                ctx.fill();

                x += barWidth + 2;
            }
        };

        draw();
    };

    return (
        <div ref={containerRef} className={`transition-all duration-500 h-20 w-full flex flex-col items-center justify-center gap-2`}>
            {isActive ? (
                <canvas ref={canvasRef} className="rounded-lg w-full h-full" />
            ) : (
                <div className="flex flex-col items-center justify-center h-full w-full">
                     {isRecording ? (
                         <div className="flex items-center gap-2 text-yellow-500 font-bold animate-pulse">
                             <span className="text-2xl">⏸</span>
                             <span>Recording Paused</span>
                         </div>
                     ) : (
                        <div className="text-gray-400 text-sm animate-pulse">Tap microphone to speak</div>
                     )}
                </div>
            )}
        </div>
    );
};
