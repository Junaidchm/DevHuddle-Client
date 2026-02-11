import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Providers } from "@/src/store/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevHuddle - Professional Developer Network",
  description: "Join DevHuddle to connect, collaborate, and grow with other developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-muted/40 min-h-screen flex flex-col font-sans">
      <header className="py-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
           {/* Placeholder for Logo if needed, text is sufficient for now */}
          <span className="font-bold text-2xl text-primary tracking-tight">DevHuddle</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <Providers>{children}</Providers>
      </main>

      <footer className="py-6 text-center">
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Help Center
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} DevHuddle. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
