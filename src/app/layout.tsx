import type { Metadata } from "next";
import "./globals.css"; // Đảm bảo import css ở đây

export const metadata: Metadata = {
  title: "PDA Fashion",
  description: "Thời trang công sở cao cấp",
};

// ĐÂY LÀ PHẦN QUAN TRỌNG ĐANG BỊ THIẾU/SAI
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}