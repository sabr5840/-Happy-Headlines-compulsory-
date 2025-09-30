// microservice-article/server.js
const express = require('express');
const app = express();

app.use(express.json());

// --- NEW: metrics + cache preload ---
const { getMetrics } = require('./metrics');
const { startPreloadJob } = require('./cache');
startPreloadJob();

app.get('/metrics', (req, res) => {
  res.json(getMetrics());
});
// ------------------------------------

const articleRoutes = require('./routes/articleRoutes');
app.use('/articles', articleRoutes);

app.get('/', (req, res) => {
  res.send('HappyHeadlines API running 🚀');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// Samlet metrics fra ArticleService + CommentService (server-til-server)
app.get('/metrics-all', async (req, res) => {
  try {
    const article = require('./metrics').getMetrics(); // lokale metrics
    const r = await fetch('http://commentservice:3001/metrics'); // interne DNS-navn/port
    const comment = await r.json();
    res.json({ article, comment });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Simpelt dashboard-HTML
app.get('/dashboard', (req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="da">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>HappyHeadlines – Cache Dashboard</title>
<style>
  body { font-family: system-ui, Arial, sans-serif; margin: 2rem; background: #fafafa; color:#222; }
  h1 { margin-bottom: .5rem; }
  .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  .card { background: #fff; border-radius: 14px; padding: 1rem 1.2rem; box-shadow: 0 4px 18px rgba(0,0,0,.06); }
  .kpi { font-size: 2rem; font-weight: 700; }
  .label { color: #666; font-size: .9rem; }
  .small { color: #888; font-size: .85rem; }
  .ok { color: #0a7f2e; } .warn { color: #b36b00; }
  .row { display:flex; gap:1rem; margin:.2rem 0 .6rem; }
</style>
</head>
<body>
  <h1>HappyHeadlines – Cache Dashboard</h1>
  <p class="small">Viser <b>cache hit/miss</b> og <b>hit ratio</b> for ArticleService og CommentService. Opdaterer hvert 2. sekund.</p>

  <div id="time" class="small"></div>

  <div class="grid" id="cards">
    <div class="card" id="article">
      <h2>ArticleService (port 3000)</h2>
      <div class="row"><div class="kpi" id="aRatio">–</div><div class="label">Hit ratio</div></div>
      <div class="row"><div id="aHits">–</div><div class="label">hits</div></div>
      <div class="row"><div id="aMisses">–</div><div class="label">misses</div></div>
    </div>
    <div class="card" id="comment">
      <h2>CommentService (port 3001)</h2>
      <div class="row"><div class="kpi" id="cRatio">–</div><div class="label">Hit ratio</div></div>
      <div class="row"><div id="cHits">–</div><div class="label">hits</div></div>
      <div class="row"><div id="cMisses">–</div><div class="label">misses</div></div>
    </div>
  </div>

<script>
async function load() {
  try {
    const r = await fetch('/metrics-all');
    const data = await r.json();

    const a = data.article || { cache_hits:0, cache_misses:0, hit_ratio:0 };
    const c = data.comment || { cache_hits:0, cache_misses:0, hit_ratio:0 };

    const fmt = (x)=> (typeof x==='number' ? x.toFixed(3).replace('.', ',') : x);
    const pct = (x)=> (typeof x==='number' ? Math.round(x*100)+'%' : '–');

    document.getElementById('aRatio').textContent = pct(a.hit_ratio);
    document.getElementById('aHits').textContent  = a.cache_hits;
    document.getElementById('aMisses').textContent= a.cache_misses;

    document.getElementById('cRatio').textContent = pct(c.hit_ratio);
    document.getElementById('cHits').textContent  = c.cache_hits;
    document.getElementById('cMisses').textContent= c.cache_misses;

    const now = new Date();
    document.getElementById('time').textContent = 'Sidst opdateret: ' + now.toLocaleTimeString();
  } catch (e) {
    console.error(e);
  }
}
load();
setInterval(load, 2000);
</script>
</body>
</html>`);
});
