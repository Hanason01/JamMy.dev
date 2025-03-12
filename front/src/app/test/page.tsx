"use client";

import { useState, useRef } from "react";

export default function TestSliderPage() {
  const [sliderValue, setSliderValue] = useState(100);
  const lastValue = useRef(100);
  const rafId = useRef<number | null>(null);

  const updateSliderValue = (value: number) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setSliderValue(value);
      lastValue.current = value; // 最後の値を保存
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-xl font-bold mb-4">カスタムスライダー テスト</h1>
      <input
        type="range"
        min="1"
        max="200"
        value={sliderValue}
        onChange={(e) => updateSliderValue(Number(e.target.value))}
        className="w-64 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
      />
      <p className="mt-2">Value: {sliderValue}</p>
    </div>
  );
}
