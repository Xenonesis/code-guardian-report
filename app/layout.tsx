import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "@/styles/base.css";
import "@/styles/responsive-utilities.css";
import "@/index.css";
import "@/styles/enhanced-ui.css";
import { ClientProviders } from "./ClientProviders";
import { MainLayout } from "@/components/layout/MainLayout";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

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
    icon: [{ url: "/shield-favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
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
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const nonce = headerStore.get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Structured data */}
        <script
          nonce={nonce}
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
        <ClientProviders>
          <MainLayout>{children}</MainLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
