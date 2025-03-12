import { useState } from "react";

export function useVolumeControl({
  mixGainNode,
}: {
  mixGainNode: GainNode | null;
}) {
  const [volume, setVolume] = useState<number>(50); // デフォルト音量（50%）

  // 音量を更新
  const updateVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume));
    if (mixGainNode) {
      mixGainNode.gain.value = (clampedVolume / 100) *2;
      setVolume(newVolume);
    } else {
      console.warn("GainNode が存在しないため、音量を変更できません");
    }
  };

  return { volume, updateVolume };
}
