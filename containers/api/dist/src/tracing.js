"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tracing.ts
const sdk_node_1 = require("@opentelemetry/sdk-node");
const exporter_trace_otlp_grpc_1 = require("@opentelemetry/exporter-trace-otlp-grpc");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const traceExporter = new exporter_trace_otlp_grpc_1.OTLPTraceExporter({
    url: "http://localhost:4317", // ADOT サイドカー
});
const sdk = new sdk_node_1.NodeSDK({
    traceExporter,
    instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
});
sdk.start();
