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
  console.log("middlewareがクッキーにアクセスした結果", token);
  if (!token) {
    const authPage = new URL('/auth', req.url);
    authPage.searchParams.set('redirectTo', url.pathname); // 元のURLを保持
    return NextResponse.redirect(authPage);
  }
  return NextResponse.next();
}

// 認証対象のパスを指定
export const config = {
  matcher: ['/mypage/:path*',
  ],
};

//注意書き）本ファイルはURL打ち込みによる静的なリクエストを制御するもの。クッキーの共有が前提となっており、独自ドメイン取得が必須となっている為、独自ドメイン取得が可能になった段階で「'/projects/:path+'」こちらおよび他の認証が必要なページについて対象として加える。