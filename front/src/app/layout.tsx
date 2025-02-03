import Script from "next/script";
import { SWRConfig } from "swr";
import { ThemeProviderWrapper } from "@components/ThemeProviderWrapper";
import { AuthModal } from "@User/AuthModal";
import { AuthProvider } from "@context/useAuthContext";
import { ProjectProvider } from "@context/useProjectContext";
import { CurrentRouteProvider } from "@context/useCurrentRouteContext"
import { ClientCacheProvider } from "@context/useClientCacheContext";
import { FeedbackProvider } from "@context/useFeedbackContext";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./globals.css";
import "@lib/opentelemetry_client";


export const metadata = {
  title: "JamMy",
  description: "JamMyアプリケーション",
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
              revalidateOnFocus: true, // タブ切り替え時に最新データを取得
              dedupingInterval: 5000, // 5秒間は同じリクエストを送らない
              shouldRetryOnError: false, // エラー時の自動リトライを無効化
            }}
            >
          <FeedbackProvider>
            <AuthProvider>
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
            </AuthProvider>
          </FeedbackProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
