import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full`}
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
