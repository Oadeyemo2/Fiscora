"use client";

// Feature 15 UI Themes: light and dark mode, remembered in the browser
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
