"use client";

import { createContext, useContext,useRef, useState } from "react";
import { WithChildren } from "@sharedTypes/types";

interface ClientCacheContextType {
  scrollPosition: React.MutableRefObject<number>;
  forceUpdate: () => void;
}

// contextの初期値
const initialContext: ClientCacheContextType = {
  scrollPosition: { current: 0 },
  forceUpdate: () => {},
};

const ClientCacheContext = createContext<ClientCacheContextType>(initialContext);

export function ClientCacheProvider({ children }: WithChildren) {
  const scrollPosition = useRef<number>(0);
  const [, setRenderFlag] = useState(false);  // 状態管理用のフラグ

  // 強制再レンダリング関数
  const forceUpdate = () => setRenderFlag((prev) => !prev);


  return (
    <ClientCacheContext.Provider
      value={{
        scrollPosition,
        forceUpdate
      }}
    >
      {children}
    </ClientCacheContext.Provider>
  );
}

export function useClientCacheContext() {
  return useContext(ClientCacheContext);
}
