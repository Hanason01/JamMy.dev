"use client";

import { createContext, useContext, useState, useRef } from "react";
import { SetState, WithChildren } from "@sharedTypes/types";

// Context初期値
const initialContext = {
  isPlaybackTriggered: false,
  setIsPlaybackTriggered: (() => {}) as SetState<boolean>,
  playbackTriggeredByRef:{ current: null } as { current: string | null },
  sharedCurrentTime: 0,
  setSharedCurrentTime: (() => {}) as SetState<number>,
  isPlaybackReset: false,
  currentTimeUpdatedByRef:{ current: null } as { current: string | null },
  setIsPlaybackReset: (() => {}) as SetState<boolean>,
  playbackResetTriggeredByRef: { current: null } as { current: string | null },
};

const PlaybackContext = createContext<typeof initialContext>(initialContext);

export function PlaybackProvider({ children }: WithChildren) {
  // 再生用
  const [isPlaybackTriggered, setIsPlaybackTriggered] = useState(false);
  const playbackTriggeredByRef = useRef<string | null>(null);

  // 再生位置同期用
  const [sharedCurrentTime, setSharedCurrentTime] = useState<number>(0);
  const currentTimeUpdatedByRef = useRef<string | null>(null);

  // リセット用
  const [isPlaybackReset, setIsPlaybackReset] = useState(false);
  const playbackResetTriggeredByRef = useRef<string | null>(null);

  // console.log("isPlaybackTriggeredの追跡", isPlaybackTriggered);
  // console.log("playbackTriggeredByRefの追��", playbackTriggeredByRef.current);

  return (
    <PlaybackContext.Provider value={{
      isPlaybackTriggered,
      setIsPlaybackTriggered,
      playbackTriggeredByRef,
      sharedCurrentTime,
      setSharedCurrentTime,
      currentTimeUpdatedByRef,
      isPlaybackReset,
      setIsPlaybackReset,
      playbackResetTriggeredByRef
      }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  return useContext(PlaybackContext);
}
