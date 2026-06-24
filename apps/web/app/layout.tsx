import type { Metadata, Viewport } from "next";
import "./globals.css";
import Chatbot from "../components/layout/Chatbot";
import ToastContainer from "../components/ui/Toast";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vipaasaorganics.com";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F7F2" },
    { media: "(prefers-color-scheme: dark)",  color: "#0F5132" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Vipaasa Organics — Pure, Artisanal & Regenerative Staples",
    template: "%s | Vipaasa Organics",
  },
  description:
    "Shop 100% natural, artisanal organic staples sourced from regenerative farms across India. Premium pulses, millets, forest honey, and desi cow ghee delivered to your door.",
  keywords: [
    "organic staples India",
    "artisanal organic food",
    "regenerative farming",
    "desi cow ghee",
    "wild forest honey",
    "organic millets",
    "organic pulses",
    "Vipaasa Organics",
  ],
  authors: [{ name: "Vipaasa Organics", url: APP_URL }],
  creator: "Vipaasa Organics",
  publisher: "Vipaasa Organics",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: "Vipaasa Organics",
    title: "Vipaasa Organics — Pure, Artisanal & Regenerative Staples",
    description:
      "Artisanal organic staples from regenerative farms across India. High-quality pulses, millets, honey, and cow ghee.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vipaasa Organics — Pure Organic Staples",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vipaasa Organics — Pure, Artisanal & Regenerative Staples",
    description:
      "Shop 100% natural organic staples sourced from regenerative farms across India.",
    images: ["/images/og-image.png"],
    creator: "@vipaasaorganics",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  alternates: { canonical: APP_URL },
  category: "shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Preconnect to Google Fonts for faster load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="relative font-sans antialiased bg-[#F9F7F2] text-[#1F3E2F]">
        {children}
        <Chatbot />
        <ToastContainer />
      </body>
    </html>
  );
}
