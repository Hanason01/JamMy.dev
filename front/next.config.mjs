/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV !== "production";
const nextConfig = {
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
  assetPrefix: dev ? "" : "https://localhost:8000",
};

export default nextConfig;
