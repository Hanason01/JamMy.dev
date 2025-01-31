"use server";

import {ProjectIndexResponse, InitialProjectData, InitialProjectResponse } from "@sharedTypes/types";
import { createInitialProjectData } from "@utils/createInitialProjectData";

export async function getProjects(page: number = 1): Promise<InitialProjectResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/v1/projects?page=${page}`, {
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

    const { data, included, meta }:ProjectIndexResponse = await response.json();

    return {
      projects: createInitialProjectData(data, included),
      meta: meta || { total_pages: 1 },
    };
  } catch (error) {
    console.error("APIエラー:", error);
    return{ projects: [], meta: { total_pages: 0 } };
  }
}
