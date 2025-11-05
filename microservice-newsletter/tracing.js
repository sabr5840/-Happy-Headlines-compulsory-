// microservice-newsletter/tracing.js (ESM)
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://jaeger:14268/api/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': { enabled: true },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
    }),
  ],
});

(async () => {
  try {
    await sdk.start();
    console.log(`OTel initialized (service.name=${process.env.OTEL_SERVICE_NAME || 'newsletterservice'})`);
  } catch (err) {
    console.error('OTel start failed:', err);
  }
})();

async function shutdown() {
  try {
    await sdk.shutdown();
  } catch (e) {
    console.error('OTel shutdown failed:', e);
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
