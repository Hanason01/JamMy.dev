"use client";

import { useEffect } from "react";
// import { useAudioProcessor } from "../../../hooks/audio/useAudioProcessor";

interface AudioProcessorProps {
  audioContext: AudioContext | null;
  gainNode: GainNode | null;
}

export function AudioProcessor({ audioContext, gainNode }: AudioProcessorProps) {
  // const { init } = useAudioProcessor();
  useEffect(() => {
    // init();
    // console.log("AudioProcessorでフックのinit()呼び出し");
  }, []);

  return(
    <div>音声編集機能実装中！（本リリースまでお待ちください）</div>
  );
};