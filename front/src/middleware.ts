import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest): NextResponse {
    //チェック対象のリクエストURL取得
    const url = req.nextUrl;

    // 静的リソースは処理しない
  if (url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/static") ||
    url.pathname.startsWith("/images") ||
    url.pathname === "/favicon.ico" ||
    url.pathname.startsWith("/fonts")) {
  return NextResponse.next();
  }
  const token = req.cookies.get("auth_cookie");
  console.log("middlewareがクッキーにアクセスした結果", token);
  if (!token) {
    const authPage = new URL("/auth", req.url);
    authPage.searchParams.set("redirectTo", url.pathname); // 元のURLを保持
    return NextResponse.redirect(authPage);
  }
  return NextResponse.next();
}

// 認証対象のパスを指定
export const config = {
  matcher: [
    "/projects/:projectId/collaboration",
    "/projects/:projectId/collaboration_management",
    "/post_project/:path*",
    "/mypage/:path*",
    "/notification/:path*"
  ],
};