import type { Metadata } from "next";
import "./globals.css";
import ConditionalShell from "@/components/conditional-shell";

export const metadata: Metadata = {
  title: "Nexora — Practice Real AI Interviews, Get Hired",
  description:
    "Nexora runs realistic AI voice interviews from your resume and job description, asks smart follow-ups, and returns deep personalized feedback.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Inter via CDN — next/font/google is avoided to prevent build-time ETIMEDOUT */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}
