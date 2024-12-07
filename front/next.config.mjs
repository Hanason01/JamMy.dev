/** @type {import('next').NextConfig} */
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
  experimental: {
    nextScriptWorkers: false, // Vercel.liveを無効化
  },
  webpack(config) {
    console.log('Next.js Webpack configuration loaded'); // 確認用のログ
    return config;
  },
};

export default nextConfig;
