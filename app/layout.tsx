import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gulf Watch — มองอ่าวไทยล่วงหน้า",
  description: "แผนที่เฝ้าระวังความขุ่นและแพลงก์ตอนบลูม อ่าวไทยตอนใน จากดาวเทียมและพยากรณ์อากาศ อัปเดตรายวัน",
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
