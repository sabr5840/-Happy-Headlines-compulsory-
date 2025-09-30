// microservice-comment/metrics.js
let hits = 0;
let misses = 0;

function recordHit()   { hits++; }
function recordMiss()  { misses++; }

function getMetrics() {
    const total = hits + misses;
    return {
        cache_hits: hits,
        cache_misses: misses,
        hit_ratio: total ? +(hits / total).toFixed(3) : 0
    };
}

module.exports = { recordHit, recordMiss, getMetrics };
