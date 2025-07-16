import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NoFears.app - Transform Your Rock Bottom Into Your Comeback Story",
  description: "The AI-powered life transformation system that helps you rebuild your life systematically. From rock bottom to thriving in 30 days with personalized micro-tasks.",
  keywords: "life transformation, AI coaching, personal development, comeback story, life wheel assessment",
  authors: [{ name: "Matteo Spissu" }],
  openGraph: {
    title: "NoFears.app - Life Transformation System",
    description: "Turn your rock bottom into your comeback story with AI-powered micro-tasks",
    url: "https://nofears.app",
    siteName: "NoFears.app",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoFears.app - Life Transformation System",
    description: "Turn your rock bottom into your comeback story with AI-powered micro-tasks",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-inter antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
