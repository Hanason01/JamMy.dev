class AudioProcessor extends AudioWorkletProcessor {
  //クラスの初期化
  constructor() {
    super();
    //録音データの蓄積場所
    this.audioData = [];
    this.isRecording = false; // メインスレッドとの連携フラグ

    // onmessageを登録
    this.port.onmessage = (event) => {
      console.log("Received message:", event.data);
      if (event.data.type === "start") {
        this.isRecording = true;
        console.log("録音開始フラグがセットされました");
      } else if (event.data.type === "stop") {
        console.log("プロセッサー側でstopメッセージを受信確認");
        this.isRecording = false;
        this.port.postMessage({ type: "complete", audioData: this.audioData });
        console.log("completeを送った時点のaudioData", this.audioData);
        this.audioData = [];
      }
    };
    console.log("RecordProcessorが初期化される");
  }

  //AudioContextが動作すると以下関数は自動で発動する
  process(inputs) {
    console.log("RecordProcessorのprocess稼働");
    console.log("processで受け取るinputs", inputs);
    if (!this.isRecording){
      console.log("processの!isRecording分岐でfalseを返す");
      return false; //録音中でない場合、processを停止する
    }
    //オーディオフレーム毎にaudioDataへデータを蓄積
    const input = inputs[0]; //マイクからのストリーム（モノラル前提）
    if (input.length > 0) {// モノラルの場合
      const channelData = input[0];
      this.audioData.push(new Float32Array(channelData));//データの蓄積
    }
    return true;
  }
}

registerProcessor('record-processor', AudioProcessor);
//カスタムプロセッサをWebAudioAPIに登録。プロセッサ名:'record-processor',登録するクラス名:AudioProcessor
