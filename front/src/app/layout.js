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
