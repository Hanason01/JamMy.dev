"use client"; //ffmpegはブラウザ環境で動作

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

// FFmpeg エンコードロジック
export const audioEncoder = async (audioBuffer, format = "FLAC") => {
  try {
    if (!["FLAC", "MP3"].includes(format)) {
      throw new Error("Unsupported format. Use 'FLAC' or 'MP3'.");
    }

    // FFmpeg インスタンスを作成
    const ffmpeg = createFFmpeg({ log: true });

    // FFmpeg をロード（初回のみ実行）
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    // AudioBuffer を PCM データ（Float32Array）に変換
    const pcmBlob = await audioBufferToPCMBlob(audioBuffer);
    const inputFileName = "input.pcm";
    const outputFileName = format === "MP3" ? "output.mp3" : "output.flac";

    // PCM データを仮想ファイルシステムに書き込む
    ffmpeg.FS("writeFile", inputFileName, await fetchFile(pcmBlob));

    // フォーマットに応じたエンコード処理
    if (format === "MP3") {
      await ffmpeg.run(
        "-f",
        "f32le", // PCM フォーマット
        "-ar",
        `${audioBuffer.sampleRate}`, // サンプルレート
        "-ac",
        `${audioBuffer.numberOfChannels}`, // チャンネル数
        "-i",
        inputFileName,
        "-b:a",
        "192k", // MP3 のビットレート
        outputFileName
      );
    } else if (format === "FLAC") {
      await ffmpeg.run(
        "-f",
        "f32le",
        "-ar",
        `${audioBuffer.sampleRate}`,
        "-ac",
        `${audioBuffer.numberOfChannels}`,
        "-i",
        inputFileName,
        "-c:a",
        "flac",
        outputFileName
      );
    }

    // エンコード結果を取得
    const encodedFile = ffmpeg.FS("readFile", outputFileName);
    const blob = new Blob([encodedFile.buffer], { type: `audio/${format.toLowerCase()}` });

    // File オブジェクトを作成して返す
    return new File([blob], `output.${format.toLowerCase()}`, { type: `audio/${format.toLowerCase()}` });
  } catch (error) {
    console.error("エンコードエラー:", error);
    throw error;
  }
};

// AudioBuffer を PCM Blob に変換するヘルパー関数
const audioBufferToPCMBlob = async (audioBuffer) => {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;

  // PCM データを格納するバッファを準備
  const buffer = new ArrayBuffer(length * numberOfChannels * 4); // Float32 (4 bytes)
  const view = new DataView(buffer);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      view.setFloat32((i * numberOfChannels + channel) * 4, channelData[i], true);
    }
  }

  return new Blob([buffer], { type: "application/octet-stream" });
};
