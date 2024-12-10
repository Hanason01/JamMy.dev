"use client";

import { useEffect, useRef, useState } from "react";
import { AudioPlayer } from "../core_logic/AudioPlayer";
import { AudioProcessor } from "../core_logic/AudioProcessor";

export function PostProjectProcessing({audioBufferForProcessing, setHasRecorded, setAudioBufferForProcessing, activeStep}){
  const audioContextForProcessingRef = useRef(null);
  const gainNodeRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false); //初期化フラグ

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] PostProjectProcessingがマウントされました`);
    console.log("PostProjectProcessingのuseEffectが開始");
    console.log("現在のisInitializedの値:", isInitialized);
    // 初期化処理（録音時とは別の Node 構成を取る）
    const initializeAudioContext = () => {
      if (audioContextForProcessingRef.current === null) {
      console.log("AudioContext と GainNode の初期化を開始");
      const context = new (window.AudioContext || window.webkitAudioContext)();

      // 音量編集用のGainNodeの作成およびDestinationへの接続
      const gainNode = context.createGain();
      gainNode.connect(context.destination);
      audioContextForProcessingRef.current = context;
      gainNodeRef.current = gainNode;

      setIsInitialized(true);
      console.log("AudioContext と GainNode を初期化しました");
      }
    };

    initializeAudioContext();

    // クリーンアップ処理
    return () => {
      console.log(`PostProjectProcessingがアンマウントされました[${new Date().toISOString()}]`);
      console.log("PostProjectProcessing.jsxのuseEffectのクリーンナップが発動");
      setIsInitialized(false);
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
        console.log("GainNode を切断しました",gainNodeRef.current);
      }
      if (audioContextForProcessingRef.current) {
        // audioContextForProcessingRef.current.close().then(() => {
          audioContextForProcessingRef.current = null;
          console.log("AudioContext を閉じました",audioContextForProcessingRef.current);
        // });
      }
      console.log("PostProjectProcessing.jsxのuseEffectのクリーンナップが完了");
    };
  }, []);

  console.log("PostProjectProcessing の現在の isInitialized（useEffectの外側に配置）:", isInitialized);
  console.log("この段階でContextがあるか", audioContextForProcessingRef.current);

  if(isInitialized){
    return(
      <div>
        <AudioPlayer
        audioBuffer={audioBufferForProcessing}
        audioContext={audioContextForProcessingRef.current}
        gainNode={gainNodeRef.current}
        setHasRecorded={setHasRecorded}
        setAudioBufferForProcessing={setAudioBufferForProcessing}
        activeStep={activeStep}
        />
        <AudioProcessor
        audioContext={audioContextForProcessingRef.current}
        gainNode={gainNodeRef.current}
        />
      </div>
    );
  }

};