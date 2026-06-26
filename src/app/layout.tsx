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
  metadataBase: new URL('https://www.volgo-student.com'),
  title: "VolGo Student Consultancy | Study in France from India",
  description: "VolGo Student is your trusted partner for studying abroad in France. We offer expert consultancy, admission guidance, and visa assistance for Indian students aiming for top French universities.",
  keywords: ["Study abroad", "Study in France", "Overseas education consultant", "Study in Europe from India", "Top universities in France", "Volgo", "France Student Visa", "Higher Education France", "Study abroad consultants in India"],
  authors: [{ name: "Volgo Team" }],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: "/images/volgo-student-consultancy-logo.webp",
  },
  openGraph: {
    title: "VolGo Student Consultancy | Study in France from India",
    description: "Your trusted partner in achieving academic excellence and realizing your dreams of higher education in France. End-to-end guidance for Indian students.",
    url: "https://www.volgo-student.com",
    siteName: "VolGo Student",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VolGo Student Consultancy",
    description: "Your partner in achieving academic excellence in France. Expert overseas education consultancy for Indian students.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "VolGo Student",
    "url": "https://www.volgo-student.com",
    "logo": "https://www.volgo-student.com/volgo-student-logo-main.png",
    "description": "VolGo Student is your trusted partner for studying abroad in France. We offer expert consultancy, admission guidance, and visa assistance for Indian students.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "36C/5, ST-2, Madurai Main Road",
      "addressLocality": "Nilakkottai, Dindigul",
      "addressRegion": "Tamil Nadu",
      "postalCode": "624 208",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91 87781 08770",
      "contactType": "Customer Support"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
