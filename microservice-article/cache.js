// microservice-article/cache.js
const NodeCache = require('node-cache');
const { getPool } = require('./db');
const { recordHit, recordMiss } = require('./metrics');

// Cache én gang pr. 10 min, varer 15 min
const cache = new NodeCache({ stdTTL: 15 * 60, checkperiod: 120 });

// Nøgler:  articles:list:<region>   -> array af artikler (sidste 14 dage)
//          article:<region>:<id>     -> enkelt artikel

async function preloadRecentArticlesForRegion(region) {
    const pool = getPool(region);
    const sql = `
    SELECT * FROM articles
    WHERE created_at >= NOW() - INTERVAL '14 days'
    ORDER BY created_at DESC
  `;
    const { rows } = await pool.query(sql);
    cache.set(`articles:list:${region}`, rows);
    // gem også enkelt-artikler i cache for hurtige opslag
    for (const a of rows) cache.set(`article:${region}:${a.id}`, a);
}

async function preloadAllRegions() {
    const regions = [
        'europe','asia','africa','northamerica','southamerica','oceania','antarctica','global'
    ];
    await Promise.all(regions.map(preloadRecentArticlesForRegion));
}

function startPreloadJob() {
    // preload ved opstart og derefter hvert 10. minut
    preloadAllRegions().catch(err => console.error('Preload error:', err));
    setInterval(() => {
        preloadAllRegions().catch(err => console.error('Preload error:', err));
    }, 10 * 60 * 1000);
}

// -------- API brugt fra service-laget ----------

function getArticlesFromCache(region) {
    const val = cache.get(`articles:list:${region}`);
    if (val) recordHit(); else recordMiss();
    return val || null;
}

function setArticlesInCache(region, articles) {
    cache.set(`articles:list:${region}`, articles);
    for (const a of articles) cache.set(`article:${region}:${a.id}`, a);
}

function getArticleFromCache(region, id) {
    const v = cache.get(`article:${region}:${id}`);
    if (v) recordHit(); else recordMiss();
    return v || null;
}

function setArticleInCache(region, article) {
    cache.set(`article:${region}:${article.id}`, article);
    // hold også liste-cachen opdateret hvis den findes
    const listKey = `articles:list:${region}`;
    const list = cache.get(listKey);
    if (list) {
        const idx = list.findIndex(a => a.id === article.id);
        if (idx >= 0) list[idx] = article; else list.unshift(article);
        cache.set(listKey, list);
    }
}

function invalidateArticle(region, id) {
    cache.del(`article:${region}:${id}`);
    const listKey = `articles:list:${region}`;
    const list = cache.get(listKey);
    if (list) {
        cache.set(listKey, list.filter(a => a.id !== parseInt(id,10)));
    }
}

module.exports = {
    startPreloadJob,
    getArticlesFromCache,
    setArticlesInCache,
    getArticleFromCache,
    setArticleInCache,
    invalidateArticle,
    preloadRecentArticlesForRegion
};
