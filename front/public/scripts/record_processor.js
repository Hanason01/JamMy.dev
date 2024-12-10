// class AudioProcessor extends AudioWorkletProcessor {
//   //クラスの初期化
//   constructor() {
//     super();
//     this.audioData = []; //録音データの蓄積場所
//     this.isRecording = false; //メインスレッドとの連携フラグ
//     this.startTime = null; //currentTime - start time等で経過時間の計算に使用
//     this.maxDuration = null; //録音最大時間

//     // onmessageを登録
//     this.port.onmessage = (event) => {
//       console.log("Received message:", event.data);
//       if (event.data.type === "start") {
//         this.isRecording = true;
//         this.startTime = currentTime;
//         this.maxDuration = event.data.duration;
//         console.log("録音開始フラグがセットされました:", this.maxDuration);
//       } else if (event.data.type === "stop") {
//         console.log("録音停止フラグがセットされました:", currentTime);
//         this.finishRecording();
//       }
//     };
//     console.log("RecordProcessorが初期化される");

    // メインスレッドへ準備完了を通知
    // this.port.postMessage({ type: "ready" });
//   }

//   //AudioContextが動作すると以下関数は自動で発動する
//   process(inputs) {
//     // console.log("RecordProcessorのprocess稼働");
//     console.log("processで受け取るinputs", inputs);
//     // console.log("process 稼働中, isRecording:", this.isRecording, "currentTime:", currentTime);
//       // 録音処理
//     if (!this.isRecording){
//       console.log("process 稼働中, isRecordingがfalseです:", currentTime);
//       return false; //録音中でない場合、processを停止する
//     }
//     //オーディオフレーム毎にaudioDataへデータを蓄積
//     const input = inputs[0]; //マイクからのストリーム（モノラル前提）
//     if (input.length > 0) {// モノラルの場合
//       const channelData = input[0];
//       this.audioData.push(new Float32Array(channelData));//データの蓄積
//     }

//     // console.log("currentTime:", currentTime);
//     // console.log("this.startTime:", this.startTime);
//     // console.log("this.maxDuration", this.maxDuration);
//     const elapsedTime = currentTime - this.startTime;
//     console.log("elapsed time:", elapsedTime);
//       if (elapsedTime >= this.maxDuration) {
//         this.finishRecording();
//       }
//     return true;
//   }

//   //完了処理の関数
//   finishRecording() {
//     console.log("finishRecordingの発動");
//     // 再呼び出し防止
//     if (!this.maxDuration) {
//       console.log("finishRecordingが実行されたが、maxDurationがなし（録音待機させる為、isRecordingをfalseに設定し、蓄積された必要のないaudioDataをクリアする");
//       this.isRecording = false; // 録音状態を無効化
//       this.audioData = []; // データをクリア
//       return;
//     }
//     if (!this.isRecording) return;

//     //完了処理
//     this.isRecording = false;
//     this.port.postMessage({ type: "complete", audioData: this.audioData });
//     console.log("completeを送った時点のaudioData", this.audioData);
//     this.audioData = [];
//   };
// }

// registerProcessor('record-processor', AudioProcessor);
// //カスタムプロセッサをWebAudioAPIに登録。プロセッサ名:'record-processor',登録するクラス名:AudioProcessor


//パターン２
// class RecordProcessor extends AudioWorkletProcessor {
//   constructor() {
//     super();
//     this.isRecording = false;

//     this.port.onmessage = (event) => {
//       if (event.data.type === "start") {
//         this.isRecording = true;
//         this.recordedData = []; // 新しい録音データを格納する配列
//       } else if (event.data.type === "stop") {
//         this.isRecording = false;
//         this.port.postMessage({
//           type: "complete",
//           audioData: this.recordedData,
//         });
//       }
//     };
//    // メインスレッドへ準備完了を通知
//     this.port.postMessage({ type: "ready" });
//   }

//   process(inputs, outputs, parameters) {
//     if (this.isRecording && inputs[0] && inputs[0][0]) {
//       // 入力データを録音データとして保存
//       this.recordedData.push(new Float32Array(inputs[0][0]));
//     }
//     return true; // 次のプロセスを継続
//   }
// }

// registerProcessor("record-processor", RecordProcessor);



//パターン３
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
      console.log("Received message:", event.data);

      if (event.data.type === "start") {
        // フラグをセット
        this.isRecording = true;
        this.isTerminated = false;
        this.startTime = currentTime;
        this.maxDuration = event.data.duration;
        console.log("録音開始されました:", this.maxDuration);
      } else if (event.data.type === "stop") {
        // 録音停止フラグをセット
        console.log("録音停止フラグがセットされました:", currentTime);
        this.finishRecording();
      } else if (event.data.type === "terminate") {
        console.log("プロセッサーが terminate メッセージを受信しました。録音を終了します。");
        this.isRecording = false; // 録音状態を無効化
        this.isTerminated = true; // 録音終了を有効化
        this.audioData = []; // データをクリア
      }
    };
    console.log("AudioProcessorが初期化されました");
    // メインスレッドへ準備完了を通知
    this.port.postMessage({ type: "ready" });
  }

  // プロセス処理
  process(inputs) {
    if (this.isTerminated) {
      console.log("録音終了フラグが有効です。processを停止します。");
      return false; // プロセッサー停止
    }
    if (!this.isRecording) {
      // 録音中でない場合は処理をスキップ
      console.log("録音中ではありません。");
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
    console.log("録音経過時間:", elapsedTime);
    if (this.maxDuration && elapsedTime >= this.maxDuration) {
      this.finishRecording();
    }

    return true; // 継続して処理を実行
  }

  // 録音完了時の処理
  finishRecording() {
    console.log("録音完了処理を開始します");

    if (!this.isRecording) {
      console.log("録音中ではありません。完了処理をスキップします。");
      return;
    }

    // 録音状態を無効化
    this.isRecording = false;

    // メインスレッドに録音データを送信
    this.port.postMessage({ type: "complete", audioData: this.audioData });
    console.log("録音データをメインスレッドに送信しました:", this.audioData);

    // 録音データをクリア
    this.audioData = [];
  }
}

// カスタムプロセッサを登録
registerProcessor('record-processor', AudioProcessor);
