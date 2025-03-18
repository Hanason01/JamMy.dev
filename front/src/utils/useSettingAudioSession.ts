  //AudioSessionの設定（試験的利用。2025年3月17日現在ではiOSのsafariのみ対応）

  export const useSettingAudioSession = () => {
    const settingAudioSession = () =>{
      //AudioSessionの設定。なければ（Safariでなければ）離脱
      if("audioSession" in navigator && navigator.audioSession){
        navigator.audioSession.sessionType = "play-and-record";
        // console.log("AudioSessionのState", navigator.audioSession.sessionType);
      } else{
        console.info("This Browser does not support AudioSessionAPI");
        return;
      }
    }
    return {settingAudioSession};
  };


  //*補足
  //まず、AudioSessionAPIは現在W3CのWorkingDraft段階であるが、試験的に導入する理由は以下
  //iOSはgetUserMediaなどでマイク接続が行われた場合、AVAudioSessionの働きにより、おそらくSessionTypeが「play-and-record」に変えられる。これはつまり以下の挙動を引き起こす
  // (1) WebAudioAPIのAudioBufferSourceによる再生はデフォルトでiOSのミュートスイッチに準じるが、ミュートスイッチを突き抜けて音声が出力される
  // (2) 出力される音声は聞く限りではおそらくハイパス、ローパスフィルターがかけられており、他にもエフェクトがかかっている可能性がある。また、これにより相対的に音量は低下する
  //
  // setSinkIdメソッドはSafariに非対応であり、個別に出力を変更する事はできない。また、こちらのAudioSessionAPIを利用したとしても、Safariへは試験的に実装されているが、現在の所、こちらで設定したsessionTypeはiOSのOSレベルでオーバーライドされている模様。つまり、上記の「通話モード」のような挙動自体は現在避けられないが、対応状況が変われば機能する。