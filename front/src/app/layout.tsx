import Script from "next/script";
import { ThemeProviderWrapper } from '@components/ThemeProviderWrapper';
import { AuthProvider } from '@context/useAuthContext';
// import { AuthModal } from '@User/AuthModal';
import { ProjectProvider } from '@context/useProjectContext';
import { CurrentRouteProvider } from "@context/useCurrentRouteContext"
import { CollaborationManagementProvider } from "@context/useCollaborationManagementContext";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './globals.css';

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
            gtag('js', new Date());
            gtag('config', 'G-NTWJ7EGQPC');
          `}
        </Script>
      </head>
      <body>
        <AuthProvider>
          <CurrentRouteProvider>
            <ProjectProvider>
              <CollaborationManagementProvider>
                <ThemeProviderWrapper>
                  {children}
                </ThemeProviderWrapper>
              </CollaborationManagementProvider>

            </ProjectProvider>
          </CurrentRouteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
