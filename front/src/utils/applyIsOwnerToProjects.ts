import { InitialProjectData, EnrichedProject } from "@sharedTypes/types";

export const applyIsOwnerToProjects = (projects: InitialProjectData[]): EnrichedProject[] => {
  if (typeof window === "undefined") {
    return projects.map((project) => ({
      ...project,
      isOwner: false,
    }));
  }
  const storedUser = localStorage.getItem("authenticatedUser");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  return projects.map((project) => ({
    ...project,
    isOwner: String(parsedUser?.id) === project.user.id,
  }));
};