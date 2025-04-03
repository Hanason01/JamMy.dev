import { useRef, useState } from "react";

export function useAudioAnalyzer() {
  const [analyzerData, setAnalyzerData] = useState<Uint8Array>(new Uint8Array(0));
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const intervalIdRef = useRef<number | null>(null);

// アナライザーの初期化
  const initializeAnalyzer = (audioContext: AudioContext | null, mediaStreamSource: MediaStreamAudioSourceNode | null): AnalyserNode | null => {
    if (!audioContext || !mediaStreamSource) {
    console.error("AudioContext または MediaStreamSource が提供されていません");
    return null;
    }

    if (analyserNodeRef.current) {
      cleanupAnalyzer(mediaStreamSource);
    }

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserNodeRef.current = analyser;

    mediaStreamSource.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;

    intervalIdRef.current = window.setInterval(() => {
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      setAnalyzerData(dataArray);
    }, 50);

    return analyser;
  };

  // アナライザーのクリーンアップ
  const cleanupAnalyzer = (mediaStreamSource: MediaStreamAudioSourceNode | null): void => {
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (mediaStreamSource && analyserNodeRef.current) {
      mediaStreamSource.disconnect(analyserNodeRef.current);
      analyserNodeRef.current.disconnect();
      analyserNodeRef.current = null;
    }
    setAnalyzerData(new Uint8Array(0));
  };

  return { analyzerData, initializeAnalyzer, cleanupAnalyzer };
}
