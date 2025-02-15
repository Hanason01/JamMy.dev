"use client";

import { createContext, useContext, useState } from "react";

type MutateFunction = (data?: any, opts?: any) => Promise<any>;

interface SWRContextType {
  myProjectsMutate: MutateFunction | null;
  setMyProjectsMutate: (fn: MutateFunction) => void;

  projectListMutate: MutateFunction | null;
  setProjectListMutate: (fn: MutateFunction) => void;

  otherUserProjectsMutate: MutateFunction | null;
  setOtherUserProjectsMutate: (fn: MutateFunction) => void;
}

const initialContext: SWRContextType = {
  myProjectsMutate: null,
  setMyProjectsMutate: () => {},

  projectListMutate: null,
  setProjectListMutate: () => {},

  otherUserProjectsMutate: null,
  setOtherUserProjectsMutate: () => {},
};

const SWRContext = createContext<SWRContextType>(initialContext);

export function SWRProvider({ children }: { children: React.ReactNode }) {
  const [myProjectsMutate, setMyProjectsMutate] = useState<MutateFunction | null>(null);
  const [projectListMutate, setProjectListMutate] = useState<MutateFunction | null>(null);
  const [otherUserProjectsMutate, setOtherUserProjectsMutate] = useState<MutateFunction | null>(null);

  return (
    <SWRContext.Provider
      value={{
        myProjectsMutate,
        setMyProjectsMutate,
        projectListMutate,
        setProjectListMutate,
        otherUserProjectsMutate,
        setOtherUserProjectsMutate,
      }}
    >
      {children}
    </SWRContext.Provider>
  );
}

export function useSWRContext() {
  return useContext(SWRContext);
}
