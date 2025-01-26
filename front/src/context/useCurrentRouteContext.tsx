"use client";

import { SetState, WithChildren } from "@sharedTypes/types";
import { useState, createContext, useContext } from "react";

interface CurrentRouteContextType {
  currentRoute: string;
  setCurrentRoute: SetState<string>;
}

// 初期値
const initialContext: CurrentRouteContextType = {
  currentRoute: "/projects",
  setCurrentRoute: () => {},
};

const CurrentRouteContext = createContext<CurrentRouteContextType>(initialContext);

// Providerコンポーネント
export const CurrentRouteProvider = ({ children }: WithChildren) => {
  const [currentRoute, setCurrentRoute] = useState<string>("/projects");

  return (
    <CurrentRouteContext.Provider value={{ currentRoute, setCurrentRoute }}>
      {children}
    </CurrentRouteContext.Provider>
  );
};

export const useCurrentRouteState = (): CurrentRouteContextType => useContext(CurrentRouteContext);