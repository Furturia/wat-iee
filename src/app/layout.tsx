import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WAT Worth It? — เทียบงาน Work & Travel USA (IEE)",
  description: "เว็บช่วยตัดสินใจและเปรียบเทียบข้อเสนองาน Work and Travel USA (Agency IEE) คำนวณจุดคืนทุน โอกาสงานสอง และความปลอดภัยของเมือง",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}

