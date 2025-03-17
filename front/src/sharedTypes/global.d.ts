  //AudioSession
  interface AudioSession{
    //タイプは以下ユニオン型で定義。一つしか選べない
    sessionType: "auto" | "playback" | "transient" | "transient-solo" | "ambient" | "play-and-record";
    state?: string; //現在のオーディオセッションの状態
    onstatechange?:()=>void;
  }

  //ブラウザのnavigatorオブジェクトにaudioSessionを追加。
  interface Navigator{
    audioSession?: AudioSession; //未対応ブラウザがある為、オプショナル定義
  }

  //* stateの補足
  // "active" = 音声が再生または録音中
  // "inactive" = オーディをセッションが停止中
  // "paused" = 一時停止中（ユーザーが音声を一時停止している）
  // "interrupted" = システムによって中断（他のアプリの通話が割り込むなど）
  // "closed" = セッションが終了

  //*onstatechangeの補足
  //stateが変わった時に実行されるイベントハンドラでたとえばinterruptedが起こった時に、音声を停止するなどの処理が可能