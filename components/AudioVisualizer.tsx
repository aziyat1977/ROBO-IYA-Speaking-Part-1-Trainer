import React, { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
    isActive: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    // Initialize with null to fix "Expected 1 arguments, but got 0" error
    const animationRef = useRef<number | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (isActive && !stream) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(audioStream => {
                    setStream(audioStream);
                    
                    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    audioContextRef.current = audioCtx;
                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 64; // Low res for cleaner "bars"
                    analyserRef.current = analyser;

                    const source = audioCtx.createMediaStreamSource(audioStream);
                    source.connect(analyser);

                    visualize();
                })
                .catch(err => console.error("Mic access denied", err));
        } else if (!isActive && stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        }

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isActive]);

    const visualize = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!analyserRef.current) return;
            animationRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 2); // Scale down

                // Dynamic color based on height/volume
                const r = barHeight + 25 * (i / bufferLength);
                const g = 250 * (i / bufferLength);
                const b = 50;

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                
                // Rounded bars
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
        <div className={`transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'} h-16 w-full flex items-center justify-center`}>
            {isActive ? (
                <canvas ref={canvasRef} width={300} height={60} className="rounded-lg" />
            ) : (
                <div className="text-gray-400 text-sm animate-pulse">Tap microphone to speak</div>
            )}
        </div>
    );
};