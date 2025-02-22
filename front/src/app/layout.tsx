import Script from "next/script";
import { SWRConfig } from "swr";
import { ThemeProviderWrapper } from "@components/ThemeProviderWrapper";
import { AuthModal } from "@User/AuthModal";
import { AuthProvider } from "@context/useAuthContext";
import { ProjectProvider } from "@context/useProjectContext";
import { CurrentRouteProvider } from "@context/useCurrentRouteContext"
import { ClientCacheProvider } from "@context/useClientCacheContext";
import { FeedbackProvider } from "@context/useFeedbackContext";
import { NotificationProvider } from "@context/useNotificationContext";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./globals.css";
import "@lib/opentelemetry_client";


export const metadata = {
  title: "JamMy - 繋がる、創る、響き合う。",
  description: "JamMyは、録音した音を重ねて仲間とコラボできる音声合成サービス。楽器がなくても、歌が苦手でもOK! 直感的な操作で、誰でも簡単にユニークなサウンドを創れる。遊び心とひらめきで、新しい音楽体験を。",
  openGraph: {
    title: "JamMy - 繋がる、創る、響き合う。",
    description: "録音した音を重ねて仲間とコラボ。ひらめきと遊び心で、唯一無二のサウンドを創ろう。",
    url: "https://jam-my.com",
    siteName: "JamMy",
    images: [
      {
        url: "/ogp-image.jpg",
        width: 1200,
        height: 630,
        alt: "JamMyのOGP画像",
      },
      {
        url: "/ogp-square.jpg",//(LINE用)
        width: 800,
        height: 800,
        alt: "JamMyのOGP画像（正方形）",
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JamMy - 繋がる、創る、響き合う。",
    description: "録音した音を重ねて仲間とコラボ。ひらめきと遊び心で、唯一無二のサウンドを創ろう。",
    images: ["/ogp-image.jpg"],
  },
};


// 本番環境で console.log を無効化
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {}; // 必要なら他のログも無効化
  console.error = () => {}; // エラーを隠したい場合
}

export default function RootLayout({ children }: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Googleタグのスクリプト */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NTWJ7EGQPC"
          strategy="afterInteractive"
        />
        {/* Googleタグのスクリプト */}
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag("js", new Date());
            gtag("config", "G-NTWJ7EGQPC");
          `}
        </Script>
      </head>
      <body>
        <SWRConfig
            value={{
              dedupingInterval: 5000, // 5秒間は同じリクエストを送らない
              shouldRetryOnError: false, // エラー時の自動リトライを無効化
            }}
            >
          <FeedbackProvider>
            <AuthProvider>
              <NotificationProvider>
                <CurrentRouteProvider>
                  <ClientCacheProvider >
                    <ProjectProvider>
                      <ThemeProviderWrapper>
                        <AuthModal />
                        {children}
                      </ThemeProviderWrapper>
                    </ProjectProvider>
                  </ClientCacheProvider>
                </CurrentRouteProvider>
              </NotificationProvider>
            </AuthProvider>
          </FeedbackProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
