"use client";

import { createContext, useContext, useState, useRef } from "react";
import { AudioBuffer,Project, User, CollaborationManagementContextType, WithChildren, ExtendedCollaboration } from "@sharedTypes/types";

// context初期値
const initialContext: CollaborationManagementContextType = {
  postAudioData: null,
  setPostAudioData: () => {},
  mergedAudioBuffer: null,
  setMergedAudioBuffer: () => {},
  globalAudioContextRef: { current: null },
  enablePostAudioPreview: false,
  setEnablePostAudioPreview: () => {},
  synthesisList: [],
  setSynthesisList: () => {},
};

const CollaborationManagementContext = createContext<CollaborationManagementContextType>(initialContext);

export function CollaborationManagementProvider({ children }: WithChildren) {
  //データ管理
  const [postAudioData, setPostAudioData] = useState<AudioBuffer | null>(null);
  const [mergedAudioBuffer, setMergedAudioBuffer] = useState<AudioBuffer | null>(null);

  //WebAudio関係管理
  const globalAudioContextRef = useRef<AudioContext | null>(null);

  //操作に関する状態管理
  const [enablePostAudioPreview, setEnablePostAudioPreview] = useState<boolean>(false);

  // 合成リストの管理
  const [synthesisList, setSynthesisList] = useState<ExtendedCollaboration[]>([]);

  return (
    <CollaborationManagementContext.Provider value={{
      postAudioData, setPostAudioData,
      mergedAudioBuffer, setMergedAudioBuffer,
      globalAudioContextRef,
      enablePostAudioPreview, setEnablePostAudioPreview,
      synthesisList, setSynthesisList
      }}>
      {children}
    </CollaborationManagementContext.Provider>
  );
}

export function useCollaborationManagementContext() {
  return useContext(CollaborationManagementContext);
}
