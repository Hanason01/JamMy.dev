"use client";

import { AudioBuffer } from "@sharedTypes/types";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export const audioEncoder = async (
  audioBuffer: AudioBuffer,
  format: "FLAC" | "MP3" = "FLAC"
): Promise<File> => {
  try {
    if (!["FLAC", "MP3"].includes(format)) {
      throw new Error("Unsupported format. Use 'FLAC' or 'MP3'.");
    }

    const ffmpeg = createFFmpeg({
      log: true,
      corePath: `${window.location.origin}/ffmpeg/ffmpeg-core.js`,//public/ffmpegへアクセス
    });

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    const pcmBlob = await audioBufferToPCMBlob(audioBuffer);
    const inputFileName = "input.pcm";
    const outputFileName = format === "MP3" ? "output.mp3" : "output.flac";

    ffmpeg.FS("writeFile", inputFileName, await fetchFile(pcmBlob));

    // フォーマットに応じたエンコード処理
    if (format === "MP3") {
      await ffmpeg.run(
        "-f",
        "f32le",
        "-ar",
        `${audioBuffer?.sampleRate}`,
        "-ac",
        `${audioBuffer?.numberOfChannels}`,
        "-i",
        inputFileName,
        "-b:a",
        "192k",
        outputFileName
      );
    } else if (format === "FLAC") {
      await ffmpeg.run(
        "-f",
        "f32le",
        "-ar",
        `${audioBuffer?.sampleRate}`,
        "-ac",
        `${audioBuffer?.numberOfChannels}`,
        "-i",
        inputFileName,
        "-c:a",
        "flac",
        outputFileName
      );
    }

    // エンコード結果を取得
    const encodedFile: Uint8Array = ffmpeg.FS("readFile", outputFileName);
    const blob = new Blob([encodedFile], { type: `audio/${format.toLowerCase()}` });
    const file = new File([blob], `audio.${format.toLowerCase()}`, { type: `audio/${format.toLowerCase()}` });

    ffmpeg.exit();

    return file;
  } catch (error: any) {
    console.error("エンコードエラー:", error);
    throw error;
  }
};

// AudioBuffer を PCM Blob に変換するヘルパー関数
const audioBufferToPCMBlob = async (audioBuffer: AudioBuffer): Promise<Blob> => {
  if (!audioBuffer) {
    throw new Error("AudioBuffer が null です");
  }
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;

  if(length && numberOfChannels){
    const buffer = new ArrayBuffer(length * numberOfChannels * 4); // Float32 (4 bytes)
    const view = new DataView(buffer);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        view.setFloat32((i * numberOfChannels + channel) * 4, channelData[i], true);
      }
    }
    const pcmBlob = new Blob([buffer], { type: "application/octet-stream" });
    return pcmBlob;
  }
  throw new Error("AudioBuffer の length または numberOfChannels が無効です");
};
