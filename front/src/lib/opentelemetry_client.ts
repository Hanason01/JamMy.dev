// import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
// import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
// import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
// import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
// import { Resource } from "@opentelemetry/resources";
// import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

// // トレーサープロバイダを作成
// const provider = new WebTracerProvider({
//   resource: new Resource({
//     [SemanticResourceAttributes.SERVICE_NAME]: "frontend", // クライアント側のサービス名
//   }),
// });

// // OTLPTraceExporter を登録（SignozのHTTPエンドポイントに送信）
// const otlpExporter = new OTLPTraceExporter({
//   url: "http://signoz-otel-collector:4318/v1/traces", // Signoz Otel CollectorのHTTPエンドポイント
// });
// provider.addSpanProcessor(new BatchSpanProcessor(otlpExporter));

// // プロバイダーを登録
// provider.register();

// // Fetchの自動インストゥルメンテーションを有効化
// new FetchInstrumentation({
//   ignoreUrls: [/localhost:14268/], // 特定のURLはトレースから除外
// });

// console.log("OpenTelemetryクライアントサイド初期化完了");
