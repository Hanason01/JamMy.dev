"use client";

import { createContext, useContext, useState, useRef } from "react";
import { EnrichedProject, ClientCacheContextType, WithChildren } from "@sharedTypes/types";

// contextの初期値
const initialContext: ClientCacheContextType = {
  cachedProject: [],
  setCachedProject: () => {},
  cachedPage: 1,
  setCachedPage: () => {},
  cachedHasMore: true,
  setCachedHasMore: () => {},
  scrollPosition: { current: 0 },
};

const ClientCacheContext = createContext<ClientCacheContextType>(initialContext);

export function ClientCacheProvider({ children }: WithChildren) {
  const [cachedProject, setCachedProject] = useState<EnrichedProject[]>([]);
  const [cachedPage, setCachedPage] = useState<number>(1);
  const [cachedHasMore, setCachedHasMore] = useState<boolean>(true);
  const scrollPosition = useRef<number>(0);

  return (
    <ClientCacheContext.Provider
      value={{
        cachedProject,setCachedProject,
        cachedPage, setCachedPage,
        cachedHasMore, setCachedHasMore,
        scrollPosition
      }}
    >
      {children}
    </ClientCacheContext.Provider>
  );
}

export function useClientCacheContext() {
  return useContext(ClientCacheContext);
}
