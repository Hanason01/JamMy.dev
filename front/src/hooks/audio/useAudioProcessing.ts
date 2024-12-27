import { AudioBuffer } from "@sharedTypes/types";

export function useAudioProcessing({
  selectedVolume,
} : {
  selectedVolume: number }) {
  const processAudio = async (buffer: AudioBuffer): Promise<AudioBuffer> => {

      if (!buffer) {
        return null;
      }

      try {
        // OfflineAudioContext を初期化
        const offlineContext = new OfflineAudioContext(
          buffer.numberOfChannels,
          buffer.length,
          buffer.sampleRate
        );

        // BufferSourceNode を作成
        const source = offlineContext.createBufferSource();
        source.buffer = buffer;

        // 音量調整の GainNode を追加
        const gainNode = offlineContext.createGain();
        gainNode.gain.value = selectedVolume; // 音量調整 (子コンポーネントから取得した値)

        // 接続: source → gainNode → destination
        source.connect(gainNode);
        gainNode.connect(offlineContext.destination);

        // 処理を開始
        source.start();
        const processedBuffer = await offlineContext.startRendering();

        return processedBuffer;
      } catch (error) {
        console.error("AudioBuffer 処理中にエラーが発生しました:", error);
        return null;
      }
    };

  return { processAudio };
}
