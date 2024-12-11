import { ThemeProviderWrapper } from '../components/ThemeProviderWrapper';
import { AuthProvider } from '../context/useAuthContext';
import { AuthModal } from '../components/User/AuthModal';
import { ProjectProvider } from '../context/useProjectContext';
import { CurrentRouteProvider } from "../context/useCurrentRouteContext"

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CurrentRouteProvider>
            <ProjectProvider>
              <ThemeProviderWrapper>
                {children}
              <AuthModal />
              </ThemeProviderWrapper>
            </ProjectProvider>
          </CurrentRouteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
