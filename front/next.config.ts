import { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/:path*", // 全てのパスに適用
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
  experimental: {
    nextScriptWorkers: false, // Vercel.liveを無効化
  },
  webpack: (config) => {
    // エイリアスを追加
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"), // `@`を`src`ディレクトリにマッピング
    };
    return config;
  },
};

export default nextConfig;
