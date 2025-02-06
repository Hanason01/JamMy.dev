import { NextRequest, NextResponse } from "next/server";
import { ProjectShowResponse, InitialProjectData } from "@sharedTypes/types";
import { createInitialProjectData } from "@utils/createInitialProjectData";

export async function GET(req: NextRequest, context : { params: Promise<Record<string, string>>}) {
  const resolvedParams = await context.params;
  const projectId = resolvedParams.projectId;

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/v1/projects/${projectId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "データ取得に失敗しました" }, { status: response.status });
    }

    const { data, included }: ProjectShowResponse = await response.json();
    const project = data.length > 0 ? createInitialProjectData(data, included) : [];

    return NextResponse.json(project);
  } catch (error) {
    console.error("APIエラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
