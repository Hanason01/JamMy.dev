import { useState } from "react";

export function useVolumeControl({
  mixGainNode,
}: {
  mixGainNode: GainNode | null;
}) {
  const [volume, setVolume] = useState<number>(1); // デフォルト音量（100%）

  // 音量を更新
  const updateVolume = (newVolume: number) => {
    if (mixGainNode) {
      mixGainNode.gain.value = newVolume;
      setVolume(newVolume);
    } else {
      console.warn("GainNode が存在しないため、音量を変更できません");
    }
  };

  return { volume, updateVolume };
}
