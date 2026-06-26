import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VolGo Student",
  description: "Your partner in achieving academic excellence and realizing your dreams of higher education in France.",
  keywords: ["Volgo", "France", "Education", "Study Abroad"],
  authors: [{ name: "Volgo Team" }],
  icons: {
    icon: "/images/channels4_profile.webp",
  },
  openGraph: {
    title: "VolGo Student",
    description: "Your partner in achieving academic excellence and realizing your dreams of higher education in France.",
    url: "https://volgo-student.com",
    siteName: "VolGo Student",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VolGo Student",
    description: "Your partner in achieving academic excellence in France.",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
