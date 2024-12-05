class AudioProcessor extends AudioWorkletProcessor {
  //クラスの初期化
  constructor() {
    super();
    this.audioData = []; //録音データの蓄積場所
    this.isRecording = false; //メインスレッドとの連携フラグ
    this.startTime = null; //currentTime - start time等で経過時間の計算に使用
    this.maxDuration = null; //録音最大時間

    // onmessageを登録
    this.port.onmessage = (event) => {
      console.log("Received message:", event.data);
      if (event.data.type === "start") {
        this.isRecording = true;
        this.startTime = currentTime;
        this.maxDuration = event.data.duration;
        console.log("録音開始フラグがセットされました:", this.maxDuration);
      } else if (event.data.type === "stop") {
        console.log("録音停止フラグがセットされました:", currentTime);
        this.finishRecording();
      }
    };
    console.log("RecordProcessorが初期化される");


  }

  //AudioContextが動作すると以下関数は自動で発動する
  process(inputs) {
    console.log("RecordProcessorのprocess稼働");
    console.log("processで受け取るinputs", inputs);
    console.log("process 稼働中, isRecording:", this.isRecording, "currentTime:", currentTime);
      // 録音処理
    if (!this.isRecording){
      console.log("process 稼働中, isRecordingがfalseです:", currentTime);
      return false; //録音中でない場合、processを停止する
    }
    //オーディオフレーム毎にaudioDataへデータを蓄積
    const input = inputs[0]; //マイクからのストリーム（モノラル前提）
    if (input.length > 0) {// モノラルの場合
      const channelData = input[0];
      this.audioData.push(new Float32Array(channelData));//データの蓄積
    }

    console.log("currentTime:", currentTime);
    console.log("this.startTime:", this.startTime);
    console.log("this.maxDuration", this.maxDuration);
    const elapsedTime = currentTime - this.startTime;
      if (elapsedTime >= this.maxDuration) {
        this.finishRecording();
      }
    return true;
  }

  //完了処理の関数
  finishRecording() {
    console.log("finishRecordingの発動");
    // 再呼び出し防止
    if (!this.maxDuration) {
      console.log("finishRecordingが実行されたが、maxDurationがなし（録音待機させる為、isRecordingをfalseに設定し、蓄積された必要のないaudioDataをクリアする");
      this.isRecording = false; // 録音状態を無効化
      this.audioData = []; // データをクリア
      return;
    }
    if (!this.isRecording) return;

    //完了処理
    this.isRecording = false;
    this.port.postMessage({ type: "complete", audioData: this.audioData });
    console.log("completeを送った時点のaudioData", this.audioData);
    this.audioData = [];
  };
}

registerProcessor('record-processor', AudioProcessor);
//カスタムプロセッサをWebAudioAPIに登録。プロセッサ名:'record-processor',登録するクラス名:AudioProcessor
