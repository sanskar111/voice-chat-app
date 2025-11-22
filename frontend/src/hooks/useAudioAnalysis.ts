import { useEffect, useState, useRef } from 'react';

export const useAudioAnalysis = (stream: MediaStream | null) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const frameRef = useRef<number>();

    useEffect(() => {
        if (!stream) return;

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        analyserRef.current = ctx.createAnalyser();
        analyserRef.current.fftSize = 256;
        sourceRef.current = ctx.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;

            setIsSpeaking(average > 10); // Threshold
            frameRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            if (sourceRef.current) sourceRef.current.disconnect();
            // Don't close context as it might be shared or expensive to recreate repeatedly
        };
    }, [stream]);

    return isSpeaking;
};
