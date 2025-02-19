export function useFetchAudioData() {
  const fetchAudioData = async (audioFileKey: string): Promise<ArrayBuffer> => {
    try {
      const response = await fetch(`/api/proxy-audio?key=${encodeURIComponent(audioFileKey)}`);
      return await response.arrayBuffer();
      //APIRoute→ArrayBufferをoutputするが、クライアントからfetchをすると型定義がReadableStreamに変換されてしまう為、再度ここでarrayBufferの変換を行う。（データ構造には影響しない）
    } catch (error) {
      console.error("音声データの取得に失敗しました:", error);
      throw new Error("Failed to fetch audio data.");
    }
  };

  return { fetchAudioData };
}
