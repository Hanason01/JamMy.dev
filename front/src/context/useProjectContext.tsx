"use client";

import { createContext, useContext, useState } from "react";
import { Project, User, ProjectContextType, WithChildren } from "@sharedTypes/types";

// context初期値
const initialContext: ProjectContextType = {
  currentProject: null,
  setCurrentProject: () => {},
  currentUser: null,
  setCurrentUser: () => {},
};

const ProjectContext = createContext<ProjectContextType>(initialContext);

export function ProjectProvider({ children }: WithChildren) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject, currentUser, setCurrentUser }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  return useContext(ProjectContext);
}
