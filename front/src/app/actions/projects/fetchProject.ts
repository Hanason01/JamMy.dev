"use server";

import { ProjectShowResponse, InitialProjectData } from "@sharedTypes/types";
import { createInitialProjectData } from "@utils/createInitialProjectData";

export async function fetchProject(projectId: string): Promise<InitialProjectData[]> {
  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/v1/projects/${projectId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("データ取得に失敗しました");
    }

    const { data, included }: ProjectShowResponse = await response.json();

    return createInitialProjectData(data, included);
  } catch (error) {
    console.error("APIエラー:", error);
    return [];
  }
}

