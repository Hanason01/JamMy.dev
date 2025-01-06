"use client";

import { createContext, useContext, useState } from "react";
import { SetState, WithChildren } from "@sharedTypes/types";

// Context初期値
const initialContext = {
  isPlaybackTriggered: false,
  setIsPlaybackTriggered: (() => {}) as SetState<boolean>,
};

const PlaybackContext = createContext<typeof initialContext>(initialContext);

export function PlaybackProvider({ children }: WithChildren) {
  const [isPlaybackTriggered, setIsPlaybackTriggered] = useState(false);

  return (
    <PlaybackContext.Provider value={{ isPlaybackTriggered, setIsPlaybackTriggered }}>
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  return useContext(PlaybackContext);
}
