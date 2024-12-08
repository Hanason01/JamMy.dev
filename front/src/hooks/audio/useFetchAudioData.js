import axios from "axios";

export function useFetchAudioData() {
  const fetchAudioData = async (audioFilePath) => {
    try {
      const response = await axios.get(audioFilePath, {
        responseType: "arraybuffer", // バイナリデータを取得
      });
      return response.data; // 実際の音声データ
    } catch (error) {
      console.error("Error fetching audio data:", error);
      throw new Error("Failed to fetch audio data.");
    }
  };

  return { fetchAudioData };
}
