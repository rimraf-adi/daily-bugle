import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Daily Bugle | AI Intelligence & Multi-Source Command Center",
  description:
    "Real-time arXiv AI paper tracker, zero-auth Reddit community crawler, Substack newsletter monitor, and OpenRouter LLM studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-[#0b0c0e] text-[#e4e4e7] selection:bg-red-500/30 selection:text-red-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
