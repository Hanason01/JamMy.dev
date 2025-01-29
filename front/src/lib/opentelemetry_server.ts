import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

// トレースプロバイダを作成
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "backend", // サーバー側のサービス名
  }),
});

// OTLPTraceExporter を登録（SignozのgRPCエンドポイントに送信）
const otlpExporter = new OTLPTraceExporter({
  url: "http://signoz-otel-collector:4317", // Signoz Otel CollectorのgRPCエンドポイント
});
provider.addSpanProcessor(new BatchSpanProcessor(otlpExporter));

// プロバイダを登録
provider.register();

console.log("OpenTelemetryサーバー初期化完了");
