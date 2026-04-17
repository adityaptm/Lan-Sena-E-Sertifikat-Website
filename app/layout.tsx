import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lansena E-Sertifikat",
  description: "Menyediakan Layanan Sertifikat Digital",
  // Konfigurasi lengkap agar Android & iOS dipaksa update
  icons: {
    icon: [
      { url: "/ls.ico?v=4", href: "/ls.ico?v=4" },
      { url: "/ls.ico?v=4", href: "/ls.ico?v=4", sizes: "32x32" },
    ],
    shortcut: "/ls.ico?v=4",
    apple: "/ls.ico?v=4", // Ini sangat penting untuk browser mobile
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/ls.ico?v=4",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
