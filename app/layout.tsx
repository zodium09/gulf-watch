import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gulf Watch — อ่าวไทยและอันดามัน",
  description: "พยากรณ์คลื่นลม ความขุ่นและแพลงก์ตอน ครอบคลุมทะเลไทยทั้งอ่าวไทยและอันดามัน อัปเดตรายวัน",
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
    <html lang="th">
      <head><link rel="stylesheet" href="/fonts/ibm-plex-sans-thai.css"/></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
