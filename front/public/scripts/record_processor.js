class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioData = []; // 録音データの蓄積場所
    this.isRecording = false; // 録音状態を管理
    this.isTerminated = false; // 録音終了を管理
    this.startTime = null; // 録音開始時間
    this.maxDuration = null; // 録音最大時間

    // メッセージ受信ハンドラを登録
    this.port.onmessage = (event) => {
      // console.log("Received message:", event.data);

      if (event.data.type === "start") {
        // フラグをセット
        this.isRecording = true;
        this.isTerminated = false;
        this.startTime = currentTime;
        this.maxDuration = event.data.duration;
        // console.log("録音開始されました:", this.maxDuration);
      } else if (event.data.type === "stop") {
        // 録音停止フラグをセット
        // console.log("録音停止フラグがセットされました:", currentTime);
        this.finishRecording();
      } else if (event.data.type === "terminate") {
        // console.log("プロセッサーが terminate メッセージを受信しました。録音を終了します。");
        this.isRecording = false; // 録音状態を無効化
        this.isTerminated = true; // 録音終了を有効化
        this.audioData = []; // データをクリア
      }
    };
    // console.log("AudioProcessorが初期化されました");
    // メインスレッドへ準備完了を通知
    this.port.postMessage({ type: "ready" });
  }

  // プロセス処理
  process(inputs) {
    if (this.isTerminated) {
      // console.log("録音終了フラグが有効です。processを停止します。");
      return false; // プロセッサー停止
    }
    if (!this.isRecording) {
      // 録音中でない場合は処理をスキップ
      // console.log("録音中ではありません。");
      return true; // `false` にするとプロセッサが停止してしまうため `true` を返す
    }

    // 録音中であればデータを収集
    const input = inputs[0]; // モノラル入力を前提
    if (input && input[0]) {
      const channelData = input[0]; // チャンネルデータを取得
      this.audioData.push(new Float32Array(channelData)); // データを蓄積
    }

    // 経過時間を計算して最大時間を超えた場合は録音停止
    const elapsedTime = currentTime - this.startTime;
    // console.log("録音経過時間:", elapsedTime);
    if (this.maxDuration && elapsedTime >= this.maxDuration) {
      this.finishRecording();
    }

    return true; // 継続して処理を実行
  }

  // 録音完了時の処理
  finishRecording() {
    // console.log("録音完了処理を開始します");

    if (!this.isRecording) {
      // console.log("録音中ではありません。完了処理をスキップします。");
      return;
    }

    // 録音状態を無効化
    this.isRecording = false;

    // 録音データに無音補完を実施
    const sampleRate = globalThis.sampleRate; // AudioWorkletProcessor の sampleRate を使用
    const maxFrames = Math.ceil(this.maxDuration * sampleRate); // 最大フレーム数を計算
    // console.log("sampleRate: " ,sampleRate);
    // console.log(`最大フレーム数: ${maxFrames}`);
    const totalFrames = this.audioData.reduce((sum, chunk) => sum + chunk.length, 0);
    // console.log(`録音データフレーム数: ${totalFrames}, 最大フレーム数: ${maxFrames}`);

    if (totalFrames < maxFrames) {
      const silenceFrames = maxFrames - totalFrames;
      const silenceBuffer = new Float32Array(silenceFrames).fill(0); // 無音部分を生成
      this.audioData.push(silenceBuffer);
      // console.log(`無音補完が完了しました: ${silenceFrames} フレーム`);
    }


    // メインスレッドに録音データを送信
    this.port.postMessage({ type: "complete", audioData: this.audioData });
    // console.log("録音データをメインスレッドに送信しました:", this.audioData);

    // 録音データをクリア
    this.audioData = [];
  }
}

// カスタムプロセッサを登録
registerProcessor("record-processor", AudioProcessor);
