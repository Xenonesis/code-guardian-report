import type { Metadata, Viewport } from "next";
import "@/styles/base.css";
import "@/index.css";
import "@/styles/enhanced-ui.css";
import "@/styles/about-page-enhancements.css";
import { ClientProviders } from "./ClientProviders";

export const metadata: Metadata = {
  metadataBase: new URL("https://code-guardian-report.vercel.app"),
  title: "Code Guardian Enterprise - AI-Powered Security Analysis Platform",
  description:
    "Enterprise-grade static code analysis platform powered by artificial intelligence. Comprehensive security assessments, vulnerability detection, OWASP compliance, and automated remediation for mission-critical applications.",
  keywords: [
    "enterprise security",
    "code analysis",
    "vulnerability detection",
    "static analysis",
    "security compliance",
    "AI security",
    "OWASP compliance",
    "SAST",
    "security scanning",
    "code review",
    "DevSecOps",
  ],
  authors: [{ name: "Code Guardian Enterprise Team" }],
  creator: "Code Guardian Enterprise Team",
  publisher: "Code Guardian Enterprise",
  applicationName: "Code Guardian Enterprise",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/shield-favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "Code Guardian Enterprise",
    title: "Code Guardian Enterprise - AI-Powered Security Analysis Platform",
    description:
      "Enterprise-grade static code analysis platform with comprehensive security assessments, AI-powered vulnerability detection, and automated remediation.",
    images: [
      {
        url: "/home.png",
        width: 1200,
        height: 630,
        alt: "Code Guardian Enterprise - Professional Security Analysis Dashboard",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@CodeGuardianAI",
    creator: "@CodeGuardianAI",
    title: "Code Guardian Enterprise - AI-Powered Security Analysis Platform",
    description:
      "Enterprise-grade static code analysis platform with comprehensive security assessments and AI-powered vulnerability detection.",
    images: ["/home.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://code-guardian-report.vercel.app/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Code Guardian Enterprise",
              operatingSystem: "Windows, Linux, macOS",
              applicationCategory: "SecurityApplication",
              applicationSubCategory: "Static Code Analysis",
              description:
                "Enterprise-grade static code analysis platform powered by artificial intelligence.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
