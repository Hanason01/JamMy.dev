// "use client";
// import useSWR from "swr";
// import { EnrichedProject, InitialProjectData } from "@sharedTypes/types";
// import { applyIsOwnerToProjects } from "@utils/applyIsOwnerToProjects";

// const fetcher = async (url: string): Promise<EnrichedProject[]> => {
//   const response = await fetch(url, { credentials: "include" });
//   if (!response.ok) throw new Error("データの取得に失敗しました");
//   const data: InitialProjectData[] = await response.json();
//   const enrichedProjects = applyIsOwnerToProjects(data)
//   return enrichedProjects;
// };

// export function useShowProject(projectId: string) {
//   const { data, error, isLoading, mutate } = useSWR(
//     projectId ? `/api/projects/${projectId}` : null,
//     fetcher,
//     {
//       suspense: true,
//       revalidateOnFocus: true,
//       revalidateOnReconnect: true,
//     }
//   );

//   return {
//     projects: data ?? [],
//     isLoading,
//     isError: !!error,
//     mutate,
//   };
// }
