import { NextRequest, NextResponse } from "next/server";
import { InitialProjectResponse, ProjectIndexResponse } from "@sharedTypes/types";
import { createInitialProjectData } from "@utils/createInitialProjectData";

export async function GET(req: NextRequest) {
  const page = req.nextUrl.searchParams.get("page") || "1";

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/v1/projects?page=${page}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "フェッチ失敗" }, { status: response.status });
    }

    const { data, included, meta }: ProjectIndexResponse = await response.json();
    const projects = createInitialProjectData(data, included);

    const responseData: InitialProjectResponse = { projects, meta };
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("APIエラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}