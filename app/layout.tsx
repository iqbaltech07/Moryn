import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: "variable",
  axes: ["opsz", "SOFT", "WONK"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Moryn | AI PRD Generator & Architecture Engine",
  description:
    "Generate professional Product Requirements Documents and system architectures in minutes with AI. Structured, accurate, and minimal hallucination, perfect for developers, PMs, and students.",
  keywords: ["Moryn", "PRD", "AI", "Product Requirements", "Architecture", "Generator", "Documentation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster
          position="top-right"
          theme="light"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              borderRadius: "8px",
            },
          }}
        />
      </body>
    </html>
  );
}
