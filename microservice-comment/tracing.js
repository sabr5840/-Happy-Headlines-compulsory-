// microservice-comment/tracing.js
'use strict';
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

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
    try { await sdk.start(); console.log(`OTel initialized (service.name=${process.env.OTEL_SERVICE_NAME||'unknown'})`); }
    catch (e) { console.error('OTel start failed:', e); }
})();
process.on('SIGTERM', async () => { try { await sdk.shutdown(); } finally { process.exit(0); }});
process.on('SIGINT',  async () => { try { await sdk.shutdown(); } finally { process.exit(0); }});
