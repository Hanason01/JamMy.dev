  //AudioSessionの設定（試験的利用。2025年3月17日現在ではiOSのsafariのみ対応）

  export const useSettingAudioSession = () => {
    const settingAudioSession = () =>{
      //AudioSessionの設定。なければ（Safariでなければ）離脱
      if("audioSession" in navigator && navigator.audioSession){
        navigator.audioSession.sessionType = "voiceCommunication";
        console.log("AudioSessionのState", navigator.audioSession.sessionType);
      } else{
        console.info("This Browser does not support AudioSessionAPI");
        return;
      }
    }
    return {settingAudioSession};
  };
