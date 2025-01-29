import axios from "axios";
import { trace } from "@opentelemetry/api";

// トレーサーを初期化
const tracer = trace.getTracer("axiosTracer");

// Axios インスタンスを作成
const axiosInstance = axios.create();

// リクエスト時にスパンを開始
axiosInstance.interceptors.request.use((config) => {
  const span = tracer.startSpan(`HTTP ${config.method?.toUpperCase()}: ${config.url}`, {
    attributes: {
      "http.method": config.method,
      "http.url": config.url,
    },
  });
  config.headers["trace-id"] = span.spanContext().traceId; // 必要に応じてトレースIDをヘッダーに追加
  config.headers["span-id"] = span.spanContext().spanId; // スパンIDも追加可能
  // スパンをコンフィグに添付して、後で終了できるようにする
  (config as any)._otSpan = span;
  return config;
});

// レスポンス成功時にスパンを終了
axiosInstance.interceptors.response.use(
  (response) => {
    const span = (response.config as any)._otSpan;
    if (span) {
      span.setAttribute("http.status_code", response.status);
      span.end();
    }
    return response;
  },
  (error) => {
    const span = (error.config as any)._otSpan;
    if (span) {
      span.setAttribute("http.status_code", error.response?.status || 500);
      span.recordException(error);
      span.setAttribute("error", true);
      span.end();
    }
    return Promise.reject(error);
  }
);

// トレース付きの axios インスタンスをエクスポート
export default axiosInstance;
