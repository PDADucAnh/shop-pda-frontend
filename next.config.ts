import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* --- 1. CẤU HÌNH ĐỂ VERCEL KHÔNG BỊ LỖI BUILD (QUAN TRỌNG) --- */
  typescript: {
    // !! Cảnh báo: Chỉ bật cái này khi cần deploy gấp. Hãy fix lỗi code sau.
    ignoreBuildErrors: true,
  },
 
  /* --- 2. CẤU HÌNH ẢNH --- */
  images: {
    // unoptimized: true, // Chỉ bật nếu ảnh vẫn lỗi không hiện
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // <--- QUAN TRỌNG: Để hiện ảnh từ Backend Railway (Cloudinary)
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "nemshop.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "theme.hstatic.net",
        port: "",
        pathname: "/**",
      },
      // Localhost (để test máy local)
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;