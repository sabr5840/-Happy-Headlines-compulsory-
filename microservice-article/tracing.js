// tracing.js (kompatibel med nye/ældre OTel-versioner)
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

// Start sikkert uanset returtype
(async () => {
    try {
        if (typeof sdk.start === 'function') await sdk.start();
        console.log(`OTel initialized (service.name=${process.env.OTEL_SERVICE_NAME || 'unknown'})`);
    } catch (err) {
        console.error('OTel start failed:', err);
    }
})();

const shutdown = async () => {
    try {
        if (typeof sdk.shutdown === 'function') await sdk.shutdown();
    } catch (e) {
        console.error('OTel shutdown failed:', e);
    } finally {
        process.exit(0);
    }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
