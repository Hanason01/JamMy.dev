"use client"; //ffmpegはブラウザ環境で動作

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

// FFmpeg エンコードロジック
export const audioEncoder = async (audioBuffer, format = "FLAC") => {
  try {
    console.log("エンコード開始");
    console.log("audioBuffer:", audioBuffer);
    console.log("format:", format);
    if (!["FLAC", "MP3"].includes(format)) {
      throw new Error("Unsupported format. Use 'FLAC' or 'MP3'.");
    }

    // FFmpeg インスタンスを作成
    const ffmpeg = createFFmpeg({
      log: true,
      corePath: `${window.location.origin}/ffmpeg/ffmpeg-core.js`,//public/ffmpegへアクセス
    });
    console.log("FFmpegインスタンス作成", ffmpeg);

    // FFmpeg をロード（初回のみ実行）
    if (!ffmpeg.isLoaded()) {
      console.log("FFmpeg をロード開始");
      await ffmpeg.load();
      console.log("FFmpeg をロード完了");
    }

    // AudioBuffer を PCM データ（Float32Array）に変換
    console.log("AudioBuffer の情報（PCMへの変換前）:", {
      numberOfChannels: audioBuffer.numberOfChannels,
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate,
    });
    const pcmBlob = await audioBufferToPCMBlob(audioBuffer);
    console.log("PCM Blob 作成成功:", pcmBlob);
    const inputFileName = "input.pcm";
    const outputFileName = format === "MP3" ? "output.mp3" : "output.flac";
    console.log("inputFileame、outputFileAme", inputFileName, outputFileName);

    // PCM データを仮想ファイルシステムに書き込む
    console.log("仮想ファイルシステムに書き込み開始");
    ffmpeg.FS("writeFile", inputFileName, await fetchFile(pcmBlob));
    console.log("仮想ファイルシステムに書き込み完了",ffmpeg);

    // フォーマットに応じたエンコード処理
    if (format === "MP3") {
      console.log("MP3エンコード開始");
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
      console.log("MP3エンコード完了");
    } else if (format === "FLAC") {
      console.log("FLACエンコード開始");
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
      console.log("FLACエンコード完了");
    }

    // エンコード結果を取得
    console.log("エンコード結果の取得開始");
    const encodedFile = ffmpeg.FS("readFile", outputFileName);
    console.log("エンコード結果取得完了:", encodedFile);
    const blob = new Blob([encodedFile.buffer], { type: `audio/${format.toLowerCase()}` });
    const file = new File([blob], `audio.${format.toLowerCase()}`, { type: `audio/${format.toLowerCase()}` });
    console.log("エンコード済みファイル:", file);

    // File オブジェクトを作成して返す
    return file;
  } catch (error) {
    console.error("エンコードエラー:", error);
    throw error;
  }
};

// AudioBuffer を PCM Blob に変換するヘルパー関数
const audioBufferToPCMBlob = async (audioBuffer) => {
  console.log("AudioBuffer を PCM Blob に変換開始（audioBufferToPCMBlob）");
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  console.log("AudioBuffer 詳細:", { numberOfChannels, length, sampleRate });

  // PCM データを格納するバッファを準備
  const buffer = new ArrayBuffer(length * numberOfChannels * 4); // Float32 (4 bytes)
  const view = new DataView(buffer);

  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    console.log(`チャンネル${channel + 1}のデータ変換開始`);
    for (let i = 0; i < length; i++) {
      view.setFloat32((i * numberOfChannels + channel) * 4, channelData[i], true);
    }
    console.log(`チャンネル${channel + 1}のデータ変換完了`);
  }
  const pcmBlob = new Blob([buffer], { type: "application/octet-stream" });
  console.log("PCM Blob 作成成功:", pcmBlob);
  return pcmBlob;
};
