import { NextResponse } from 'next/server';

export function middleware(req) {
    //チェック対象のリクエストURL取得
    const url = req.nextUrl;

    // 静的リソースは処理しない
  if (url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/static') ||
    url.pathname.startsWith('/images') ||
    url.pathname === '/favicon.ico' ||
    url.pathname.startsWith('/fonts')) {
  return NextResponse.next();
  }
  const token = req.cookies.get('auth_cookie');

  if (!token) {
    const authPage = new URL('/auth', req.url);
    authPage.searchParams.set('redirectTo', url.pathname); // 元のURLを保持
    return NextResponse.redirect(authPage);
  }
  return NextResponse.next();
}

// 認証対象のパスを指定
export const config = {
  matcher: ['/mypage/:path*', '/projects/:path+',
  ],
};