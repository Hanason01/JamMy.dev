import { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/:path*", // 全てのパスに適用
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" }, //FFmpegでsame-origin必須
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" }, //FFmpegの利用、クッキー利用でrequire-corp必須
        ],
      },
    ];
  },
  experimental: {
    nextScriptWorkers: false, // Vercel.liveを無効化
  },
  webpack: (config: any) => {
    // エイリアスを追加
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "src"), // `@`を`src`ディレクトリにマッピング
    };
    return config;
  },
};


export default nextConfig;
