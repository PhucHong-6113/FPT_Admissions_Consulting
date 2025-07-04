import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FPT University - Tư vấn Tuyển sinh",
  description: "Đại học FPT - Môi trường giáo dục hiện đại, đào tạo nhân tài công nghệ và kinh doanh. Đăng ký tư vấn tuyển sinh ngay hôm nay!",
  keywords: "FPT University, tuyển sinh, đại học FPT, công nghệ thông tin, kinh doanh, thiết kế, ngôn ngữ",
  authors: [{ name: "FPT University" }],
  openGraph: {
    title: "FPT University - Tư vấn Tuyển sinh",
    description: "Đại học FPT - Môi trường giáo dục hiện đại, đào tạo nhân tài công nghệ và kinh doanh",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
