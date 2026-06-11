import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vipaasa Organics",
  description: "Artisanal, sustainable, and regenerative organics directly from Earth's lap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
