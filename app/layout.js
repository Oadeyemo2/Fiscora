import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import {  ClerkProvider} from '@clerk/nextjs'
import { Toaster } from "sonner";

const inter = Inter({subsets:['latin']});

export const metadata = {
  title: "Fiscora",
  description: "Fiscora: personal finance with AI receipt scanning and advice",
};

export default function RootLayout({ children }) {
    return (<ClerkProvider>

  <html lang="en">
      <body
        className={`${inter.className}`}>
          <Header/>
        <main className="min-h-screen">{children}</main>
        <Toaster richColors />
        <footer className="bg-blue-100 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600 ">
          <p>Fiscora · Group 2 · Software Engineering, Fall 2026</p>
          </div></footer>
      </body>
    </html>
          </ClerkProvider>
  );
}
