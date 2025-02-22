import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_API_URL}/api/v1/notifications`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "通知の取得に失敗しました" }, { status: response.status });
    }

    const notifications = await response.json();
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("通知取得エラー:", error);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
