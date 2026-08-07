import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.PAGES_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Radical Edge Static Ads Creator",
  description: "Create sharp, credible, Canva-ready proof ads for Radical Edge.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
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
