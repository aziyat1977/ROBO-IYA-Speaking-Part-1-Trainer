import { useState, useRef } from 'react';

export const useScreenRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = async () => {
        try {
            setMediaBlobUrl(null);
            
            // 1. Get Microphone Stream (Essential)
            const micStream = await navigator.mediaDevices.getUserMedia({ 
                audio: { echoCancellation: true, noiseSuppression: true } 
            });

            let combinedStream = micStream;

            // 2. Try Get Screen Stream (Visuals)
            if (navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia) {
                try {
                    const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
                        video: { cursor: "always" },
                        audio: false 
                    });
                    
                    const tracks = [
                        ...screenStream.getVideoTracks(),
                        ...micStream.getAudioTracks()
                    ];
                    combinedStream = new MediaStream(tracks);
                } catch (screenErr) {
                    console.warn("Screen recording cancelled or failed, falling back to audio only.", screenErr);
                }
            }

            streamRef.current = combinedStream;

            let mimeType = '';
            if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
                mimeType = 'video/webm; codecs=vp9';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            }

            if (combinedStream.getVideoTracks().length === 0) {
                 if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
                 else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
                 else mimeType = '';
            }

            const options = mimeType ? { mimeType } : undefined;
            const recorder = new MediaRecorder(combinedStream, options);
            
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const type = chunksRef.current[0]?.type || 'video/webm';
                const blob = new Blob(chunksRef.current, { type });
                const url = URL.createObjectURL(blob);
                setMediaBlobUrl(url);
                
                // Stop all tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            // Handle user stopping via browser UI
            combinedStream.getVideoTracks()[0]?.addEventListener('ended', () => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                    setIsPaused(false);
                }
            });

            recorder.start();
            setIsRecording(true);
            setIsPaused(false);

        } catch (err) {
            console.error("Recording error:", err);
            alert("Could not start recording. Please ensure microphone permissions are granted.");
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
        }
    };

    const downloadRecording = () => {
        if (!mediaBlobUrl) return;
        const a = document.createElement('a');
        a.href = mediaBlobUrl;
        const isAudio = mediaBlobUrl.includes('audio'); // simplistic check, mostly webm video
        a.download = `speakflow-session-${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return { 
        isRecording, 
        isPaused, 
        startRecording, 
        stopRecording, 
        pauseRecording, 
        resumeRecording,
        mediaBlobUrl,
        downloadRecording
    };
};