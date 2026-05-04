import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AdaptiveUI — AI-powered adaptive search",
  description:
    "Ask anything and get a rich, adaptive UI generated on the fly using AI. Cards, charts, code, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('adaptive-ui-theme');
                if (stored) {
                  const parsed = JSON.parse(stored);
                  if (parsed?.state?.mode === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                  if (parsed?.state?.theme) {
                    document.body.setAttribute('data-theme', parsed.state.theme);
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
