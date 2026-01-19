import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IMPACT Project Gallery | Code Ninjas",
  description: "Share your IMPACT MakeCode Arcade creations with the world!",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
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
