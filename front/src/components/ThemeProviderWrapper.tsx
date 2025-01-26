"use client";

import { WithChildren } from "@sharedTypes/types";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@theme/Theme";

export function ThemeProviderWrapper({ children }: WithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}