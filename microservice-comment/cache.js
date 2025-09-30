// microservice-comment/cache.js
const { LRUCache } = require('lru-cache');
const { recordHit, recordMiss } = require('./metrics');

const cache = new LRUCache({
    max: 30,                // behold kun 30 article_id-keys i cachen
    ttl: 15 * 60 * 1000     // 15 min
});

function getComments(articleId) {
    const v = cache.get(String(articleId));
    if (v) recordHit(); else recordMiss();
    return v || null;
}

function setComments(articleId, comments) {
    cache.set(String(articleId), comments);
}

function invalidate(articleId) {
    cache.delete(String(articleId));  // v10+: delete (ikke del)
}

module.exports = { getComments, setComments, invalidate };
