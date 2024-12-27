import { useState } from "react";

export function useReverbControl({
  reverbInputGainNode,
}: {
  reverbInputGainNode: GainNode | null;
}) {
  const [reverbLevel, setReverbLevel] = useState<number>(0); // デフォルトリバーブレベル

  // リバーブレベルを更新
  const updateReverbLevel = (newLevel: number) => {
    if (reverbInputGainNode) {
      reverbInputGainNode.gain.value = newLevel;
      setReverbLevel(newLevel);
    } else {
      console.warn("ReverbInputGainNode が存在しないため、リバーブを変更できません");
    }
  };

  return { reverbLevel, updateReverbLevel };
}
