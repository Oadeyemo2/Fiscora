import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import {  ClerkProvider} from '@clerk/nextjs'
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({subsets:['latin']});

export const metadata = {
  title: "Fiscora",
  description: "Fiscora: personal finance with AI receipt scanning and advice",
};

export default function RootLayout({ children }) {
    return (<ClerkProvider>

  <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background text-foreground`}>
        <ThemeProvider>
          <Header/>
        <main className="min-h-screen">{children}</main>
        <Toaster richColors />
        <footer className="bg-emerald-50 dark:bg-emerald-950/40 py-12 border-t border-emerald-100 dark:border-emerald-900">
          <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>Fiscora · Group 2 · Software Engineering, Fall 2026</p>
          </div></footer>
        </ThemeProvider>
      </body>
    </html>
          </ClerkProvider>
  );
}
