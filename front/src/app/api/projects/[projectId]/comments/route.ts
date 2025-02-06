import { NextRequest, NextResponse } from "next/server";
import { ProjectCommentsResponse } from "@sharedTypes/types";
import { createInitialComments } from "@utils/createInitialComments";

export async function GET(req: NextRequest, context: { params: Promise<Record<string, string>>}) {
  const resolvedParams = await context.params;
  const projectId = resolvedParams.projectId;
  const page = req.nextUrl.searchParams.get("page") || "1";

  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/v1/projects/${projectId}/comments?page=${page}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "コメントの取得に失敗しました" }, { status: response.status });
    }

    const { data, included, meta }: ProjectCommentsResponse = await response.json();

    const comments = data.length > 0 ? createInitialComments(data, included) : [];
    const responseData = { comments, meta: meta || { total_pages: 0 } };
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("コメントAPIエラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
