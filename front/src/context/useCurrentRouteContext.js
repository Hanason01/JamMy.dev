"use client";

import { useState, createContext, useContext } from "react";

const CurrentRouteContext = createContext();

// Providerコンポーネント
export const CurrentRouteProvider = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState("/projects");

  return (
    <CurrentRouteContext.Provider value={{ currentRoute, setCurrentRoute }}>
      {children}
    </CurrentRouteContext.Provider>
  );
};

export const useCurrentRouteState = () => useContext(CurrentRouteContext);