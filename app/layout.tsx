import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radical Edge Static Ads Creator",
  description: "Create sharp, credible, Canva-ready proof ads for Radical Edge.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
