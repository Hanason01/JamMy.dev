import axios from "axios";

// axiosのインスタンス作成
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// リクエストインターセプターでCSRFトークンを追加
axiosInstance.interceptors.request.use((config) => {
  // ブラウザからCSRFトークンを取得
  const csrfToken = document
    .querySelector("meta[name='csrf-token']")
    ?.getAttribute("content");

  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
});

export default axiosInstance;
