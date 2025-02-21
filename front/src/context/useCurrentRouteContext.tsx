"use client";

import { SetState, WithChildren } from "@sharedTypes/types";
import { useState, createContext, useContext } from "react";

interface CurrentRouteContextType {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  previousRoute: string | null;
  setPreviousRoute: (route: string | null) => void;
  lastDetailRoute: string | null;
  setLastDetailRoute: (route: string | null) => void;
}

// 初期値
const initialContext: CurrentRouteContextType = {
  currentRoute: "/projects",
  setCurrentRoute: () => {},
  previousRoute: null,
  setPreviousRoute: () => {},
  lastDetailRoute: null,
  setLastDetailRoute: () => {},
};

const CurrentRouteContext = createContext<CurrentRouteContextType>(initialContext);

// Providerコンポーネント
export const CurrentRouteProvider = ({ children }: WithChildren) => {
  const [currentRoute, setCurrentRouteState] = useState<string>("/projects");
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [lastDetailRoute, setLastDetailRoute] = useState<string | null>(null);

  //遷移時の処理
  const setCurrentRoute = (newRoute: string) => {
    if (newRoute !== currentRoute) {
      setPreviousRoute(currentRoute); // 遷移前のページを保持
    }
    setCurrentRouteState(newRoute);
  };

  return (
    <CurrentRouteContext.Provider
    value={{
      currentRoute,setCurrentRoute,
      previousRoute,setPreviousRoute,
      lastDetailRoute, setLastDetailRoute
      }}>
      {children}
    </CurrentRouteContext.Provider>
  );
};

export const useCurrentRouteState = (): CurrentRouteContextType => useContext(CurrentRouteContext);