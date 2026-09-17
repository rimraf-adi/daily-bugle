import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('bugle-theme');
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
