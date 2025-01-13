"use client";

import { AudioBuffer, SetState } from "@sharedTypes/types";
import { useEffect, useRef, useState } from "react";
import { Box, Button, IconButton, CircularProgress, FormGroup, FormControlLabel, Switch} from "@mui/material";
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { AudioPlayer } from "@Project/core_logic/AudioPlayer";
import { AudioProcessor } from "@Project/core_logic/AudioProcessor";
import { useAudioProcessing } from "@audio/useAudioProcessing";
import { usePlayback } from "@context/usePlayBackContext";


export function PostProjectProcessing({
  id,
  mode,
  audioBufferForProcessing,
  setHasRecorded,
  setAudioBufferForProcessing,
  setAudioBufferForPost,
  onNext,
  returnToStep1Mode,
  enablePostAudioPreview,
  setEnablePostAudioPreview
} : {
  id: string; //オプショナル
  mode: "player-only" | "with-effects";
  audioBufferForProcessing: AudioBuffer;
  setHasRecorded: SetState<boolean>;
  setAudioBufferForProcessing: SetState<AudioBuffer>;
  setAudioBufferForPost: SetState<AudioBuffer>;
  onNext: () => void;
  returnToStep1Mode: "edit" | "record";
  enablePostAudioPreview?: boolean; //オプショナル
  setEnablePostAudioPreview?: SetState<boolean>; //オプショナル
  }){
  const audioContextForProcessingRef = useRef<AudioContext | null>(null);
  // const reverbInputGainNodeRef = useRef<GainNode | null>(null); //リバーブ調整node
  // const convolverNodeRef = useRef<{
  //   left: ConvolverNode | null;
  //   right: ConvolverNode | null;
  // }>({ left: null, right: null });//リバーブ成分生成node
  const mixGainNodeRef = useRef<GainNode | null>(null); //音量調整node
  const [isInitialized, setIsInitialized] = useState<boolean>(false); //初期化フラグ
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態
  const [selectedVolume, setSelectedVolume] = useState<number>(1); // 音量管理

  const { processAudio } = useAudioProcessing({ selectedVolume });

  //Context関連
  const {
    setIsPlaybackTriggered, playbackTriggeredByRef,
    setIsPlaybackReset, playbackResetTriggeredByRef} = usePlayback();

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] PostProjectProcessingがマウントされました`);
    console.log("PostProjectProcessingのuseEffectが開始");
    console.log("現在のisInitializedの値:", isInitialized);
    // 初期化処理（録音時とは別の Node 構成を取る）

    let isMounted = true; // マウント状態を追跡

    const initializeAudioContext = async (): Promise<void> => {
      if (!isMounted) return;

      if (audioContextForProcessingRef.current === null) {
      console.log("AudioContext と GainNode の初期化を開始");
      const context = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 44100
      });
      console.log("AudioContextの初期化が終了");
      audioContextForProcessingRef.current = context;

      // エフェクトモードの場合、各Node構築
      if (!isMounted) return;
      if (mode === "with-effects"){
        //ノード作成
        // const leftConvolver = context.createConvolver();
        // const rightConvolver = context.createConvolver();
        // const reverbGainNode = context.createGain();
        // reverbGainNode.gain.value = 0; // デフォルトは無効
        const mixGainNode = context.createGain();

        // // IRデータのロード（非同期）
        // try {
        //   if (!isMounted) return;
        //   const [leftIR, rightIR] = await Promise.all([
        //     fetch("audios/impulse-response-L.wav")
        //       .then((res) => res.arrayBuffer())
        //       .then((buffer) => context.decodeAudioData(buffer)),
        //     fetch("audios/impulse-response-R.wav")
        //       .then((res) => res.arrayBuffer())
        //       .then((buffer) => context.decodeAudioData(buffer)),
        //   ]);
        //   leftConvolver.buffer = leftIR;
        //   rightConvolver.buffer = rightIR;
        //   console.log("Left ConvolverNode Buffer:", leftConvolver.buffer);
        //   console.log("Right ConvolverNode Buffer:", rightConvolver.buffer);

        // } catch (error) {
        //   console.error("IRデータのロードまたはデコードに失敗しました:", error);
        // }

        //   //接続(ReverbInputGainNode → ChannelSplitter → (L/R ConvolverNodes) → ChannelMerger → MixGainNode → Destination)
        // if (!isMounted) return;
        // const splitter = context.createChannelSplitter(2);
        // const merger = context.createChannelMerger(2);

        // reverbGainNode.connect(splitter); // リバーブ入力をスプリット
        // splitter.connect(leftConvolver, 0); // 左チャンネル
        // splitter.connect(rightConvolver, 1); // 右チャンネル

        // leftConvolver.connect(merger, 0, 0); // 左をマージ
        // rightConvolver.connect(merger, 0, 1); // 右をマージ

        // merger.connect(mixGainNode); // マージ後にミックス
        mixGainNode.connect(context.destination); // 出力

        //保持
        if (!isMounted) return;
        // reverbInputGainNodeRef.current = reverbGainNode;
        // convolverNodeRef.current = { left: leftConvolver, right: rightConvolver };
        mixGainNodeRef.current = mixGainNode;
      }

      //初期化完了
      if (isMounted){
        setIsInitialized(true);
        console.log("AudioContext と GainNode を初期化しました");
      }
    }
    };
    initializeAudioContext();

    // クリーンアップ処理
    return () => {
      isMounted = false;
      console.log(`PostProjectProcessingがアンマウントされました[${new Date().toISOString()}]`);
      console.log("PostProjectProcessing.jsxのuseEffectのクリーンナップが発動");
      setIsInitialized(false);

      // ノードのクリーンアップ
      // if (reverbInputGainNodeRef.current) {
      //   reverbInputGainNodeRef.current.disconnect();
      //   reverbInputGainNodeRef.current = null;
      //   console.log("ReverbInputGainNode を切断しました");
      // }

      // if (convolverNodeRef.current) {
      //   if (convolverNodeRef.current.left) {
      //     convolverNodeRef.current.left.disconnect();
      //     console.log("Left ConvolverNode を切断しました");
      //   }
      //   if (convolverNodeRef.current.right) {
      //     convolverNodeRef.current.right.disconnect();
      //     console.log("Right ConvolverNode を切断しました");
      //   }
      //   convolverNodeRef.current = { left: null, right: null };
      // }

      if (mixGainNodeRef.current) {
        mixGainNodeRef.current.disconnect();
        mixGainNodeRef.current = null;
        console.log("MixGainNode を切断しました", mixGainNodeRef.current);
      }

      if (audioContextForProcessingRef.current) {
        console.log("AudioContext の状態:", audioContextForProcessingRef.current.state);
          audioContextForProcessingRef.current = null;
          console.log("AudioContext を閉じました", audioContextForProcessingRef.current);
      }

      console.log("PostProjectProcessing.jsxのuseEffectのクリーンナップが完了");
    };
  }, [returnToStep1Mode === "edit"]);

  // console.log("PostProjectProcessing の現在の isInitialized（useEffectの外側に配置）:", isInitialized);
  // console.log("この段階でContextがあるか", audioContextForProcessingRef.current);


    //閉じるボタン処理
    const handleCloseClick = () => {
      console.log("AudioPlayerを閉じました");
      playbackResetTriggeredByRef.current = id;
      setIsPlaybackReset(true);
      setHasRecorded?.(false);
      setAudioBufferForProcessing?.(null);
      setEnablePostAudioPreview?.(false);
    }

  // 投稿ボタンを押したときの処理
  const handleSubmit = async () => {
    setLoading(true); // ローディング状態を開始
    setTimeout(async () => {
      try {
        if (audioBufferForProcessing) {
          console.log("AudioBuffer の処理を開始します...");
          const processedBuffer = await processAudio(audioBufferForProcessing);
          console.log("AudioBuffer の処理が完了しました:", processedBuffer);

          // 処理後の AudioBuffer を親コンポーネントに渡しプレビュー用bufferを解除
          setAudioBufferForPost(processedBuffer);
        }
        onNext(); // 次のステップに進む
      } catch (error) {
        console.error("AudioBuffer の処理中にエラーが発生しました:", error);
      } finally {
        setLoading(false); // ローディング状態を終了
      }
    }, 100);
  };

  //同時再生制御関数
  const handleEnablePostAudioPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
      setIsPlaybackTriggered(false);
      playbackTriggeredByRef.current = null;
      setIsPlaybackReset(true);
      playbackResetTriggeredByRef.current = "toggle";
      if(setEnablePostAudioPreview){
        setEnablePostAudioPreview(isChecked);
      }
  }

  if(isInitialized){
    return(
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%"}}>
        { id && (
        <FormGroup sx={{my:1,width: "60%"}}>
          <FormControlLabel required control={
            <Switch
            checked={enablePostAudioPreview}
            onChange={(e) =>{handleEnablePostAudioPreview(e);}}
            />
          }label="投稿音声と同時に聴く"
          sx={{
            "& .MuiFormControlLabel-label": {
              fontSize: "0.9rem",
              color: "text.primary",
            },
          }} />
        </FormGroup>
        )}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb:8, mt:2, mx: 1}}>
          <Box sx={{ flex: 2 }}>
            <AudioPlayer
            id={id} //Collaboration
            audioBuffer={audioBufferForProcessing}
            audioContext={audioContextForProcessingRef.current}
            gainNode={mixGainNodeRef.current} //with-effectsモードのみ
            enablePostAudioPreview={enablePostAudioPreview}
            />
          </Box>
          {mode === "with-effects" && audioContextForProcessingRef.current &&(
            <Box sx={{ flex: "0 0 auto" }}>
              <AudioProcessor
              mixGainNode={mixGainNodeRef.current}
              setSelectedVolume={setSelectedVolume}
              // reverbInputGainNode={reverbInputGainNodeRef.current}
              />
            </Box>
          )}
          <IconButton
            onClick={handleCloseClick}
            sx={{
              alignSelf: "flex-start",
              color: "gray",
            }}
            aria-label="Close"
          >
            <HighlightOffIcon fontSize="large"/>
          </IconButton>
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Button
          onClick={handleSubmit}
          variant="primary"
          disabled={loading}
          startIcon={loading && <CircularProgress size={24} />}
          >
            投稿する
          </Button>
        </Box>
      </Box>
    );
  }
};