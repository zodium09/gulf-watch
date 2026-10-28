import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gulf Watch — อ่าวไทยและอันดามัน",
  description: "แผนที่ทะเลไทยแบบโต้ตอบ พยากรณ์คลื่น ลม ฝน อุณหภูมิผิวน้ำ และคัดกรองปัจจัยอากาศสำหรับกิจกรรมทะเล พร้อมหลักการและแหล่งข้อมูล",
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
