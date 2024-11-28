"use client";

import { createContext, useContext, useState } from "react";

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject, currentUser, setCurrentUser }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  return useContext(ProjectContext);
}
