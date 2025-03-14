import { useState, useEffect } from "react";
import { AudioBuffer, ExtendedCollaboration,SetState } from "@sharedTypes/types";

export function useAudioMerge({
  postAudioData,
  synthesisList,
  globalAudioContextRef,
  setMergedAudioBuffer
}:{
  postAudioData: AudioBuffer | null;
  synthesisList: ExtendedCollaboration[];
  globalAudioContextRef: AudioContext | null;
  setMergedAudioBuffer:SetState<AudioBuffer | null>;
}) {


  const mergeAudioBuffers = async (): Promise<void> => {
    if (!globalAudioContextRef || !postAudioData || synthesisList.length === 0) {
      console.error("globalAudioContextRefもしくはpostAudio, synthesisList合成リストがありません");
      setMergedAudioBuffer(null);
      return;
    }

    try {
      // 合成するすべてのAudioBuffer
      const allBuffers = [
        ...(postAudioData ? [postAudioData] : []),
        ...synthesisList.map((item) => item.audioBuffer),
      ]


      // AudioBufferが存在しない場合
      if (allBuffers.length === 0) {
        console.error("AudioBuffer が存在しません");
        setMergedAudioBuffer(null);
        return;
      }

      // 最大チャンネル数を計算
      const maxChannels = allBuffers.reduce((max, buffer) => {
        if (!buffer) {
          console.error("reduce 内で null または undefined の AudioBuffer が見つかりました");
          return max;
        }
        return Math.max(max, buffer.numberOfChannels);
      }, 1);

      // 音声の長さ取得（全ての音声が同じ長さ前提）
      const bufferLength = allBuffers[0]?.length || 0;
      if (bufferLength === 0) {
        console.error("合成対象の音声がありません");
        setMergedAudioBuffer(null);
        return;
      }

      // 新しいAudioBufferを作成
      const outputBuffer = globalAudioContextRef!.createBuffer(
        maxChannels,
        bufferLength,
        globalAudioContextRef!.sampleRate
      );

      // 各 AudioBuffer をコピー
      allBuffers.forEach((buffer) => {
        if (!buffer) {
          console.error("allBuffers 内で null または undefined の AudioBuffer が見つかりました");
          return;
        }
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          const outputChannelData = outputBuffer.getChannelData(channel);
          const inputChannelData = buffer.getChannelData(channel);

          // データをそのままコピー
          for (let i = 0; i < bufferLength; i++) {
            outputChannelData[i] += inputChannelData[i];
          }
        }
      });

      setMergedAudioBuffer(outputBuffer);
    } catch (error) {
      console.error("音声合成エラー:", error);
      setMergedAudioBuffer(null);
    }
  };

  return {
    mergeAudioBuffers
  };
}
