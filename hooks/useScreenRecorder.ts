import { useState, useRef } from 'react';

export const useScreenRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = async () => {
        try {
            // 1. Get Microphone Stream (Essential)
            const micStream = await navigator.mediaDevices.getUserMedia({ 
                audio: { echoCancellation: true, noiseSuppression: true } 
            });

            let combinedStream = micStream;

            // 2. Try Get Screen Stream (Visuals)
            // Note: getDisplayMedia is not supported on all mobile browsers.
            // We check for existence.
            if (navigator.mediaDevices && (navigator.mediaDevices as any).getDisplayMedia) {
                try {
                    const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
                        video: { cursor: "always" },
                        audio: false // We prioritize mic audio
                    });
                    
                    // Combine Mic Audio + Screen Video
                    const tracks = [
                        ...screenStream.getVideoTracks(),
                        ...micStream.getAudioTracks()
                    ];
                    combinedStream = new MediaStream(tracks);
                } catch (screenErr) {
                    console.warn("Screen recording cancelled or failed, falling back to audio only.", screenErr);
                    // Fallback to mic only (already set)
                }
            }

            streamRef.current = combinedStream;

            // Detect MIME type support
            let mimeType = '';
            if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9')) {
                mimeType = 'video/webm; codecs=vp9';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                mimeType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/mp4';
            }

            // If we are audio-only, adjust mime
            if (combinedStream.getVideoTracks().length === 0) {
                 if (MediaRecorder.isTypeSupported('audio/webm')) mimeType = 'audio/webm';
                 else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
                 else mimeType = ''; // Browser default
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
                const a = document.createElement('a');
                a.href = url;
                
                const ext = type.includes('audio') ? 'webm' : 'webm'; // Default to webm for broad compatibility
                a.download = `speakflow-recording-${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.${ext}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Stop all tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            };

            // If user stops screen share via browser UI
            combinedStream.getVideoTracks()[0]?.addEventListener('ended', () => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                }
            });

            recorder.start();
            setIsRecording(true);

        } catch (err) {
            console.error("Recording error:", err);
            alert("Could not start recording. Please ensure microphone permissions are granted.");
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return { isRecording, startRecording, stopRecording };
};