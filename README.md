# HappyHeadlines – Distributed Article & Comment Service (med caching)

Dette projekt er en nyhedsplatform med microservices, z-axis split, to cache-lag og metrics:

- **ArticleCache**: offline/periodisk preload af artikler fra seneste 14 dage og cache-first opslag
- **CommentCache**: LRU (Least Recently Used) for maks 30 nøgler (pr. `article_id`-liste) med cache-miss approach
- **/metrics** på begge services (hit/miss og hit ratio)..
!!
---

## Arkitektur

- **ArticleService** (Node/Express, port 3000)
    - CRUD på artikler i regionsopdelte Postgres-databaser (europe, asia osv.)
    - **ArticleCache**: preloader sidste 14 dage ved opstart og periodisk
- **CommentService** (Node/Express, port 3001)
    - Opret/hent/slet kommentarer (fælles Comment-DB)
    - **CommentCache**: LRU 30 (cache-miss approach)
    - Kalder ProfanityService med circuit breaker
- **ProfanityService** (port 4000), DraftService (port 3002)
- **PostgreSQL**: 8 region-DB’er - 1 til kommentarer og 1 til profanity

---

## Opsætning af projekt

### Forudsætninger
- Docker Desktop

### Start
```bash
# i mappen med docker-compose.yml
docker network create happyheadlines_net    # skal kun gøres 1 gang
docker compose up --build -d
```

Tjek at alt kører:
```bash
docker compose ps
```

### Stop
```bash
docker compose down
```

---
## Distributed tracing – OpenTelemetry og Jaeger indsat

**Formål:** At kunne følge et request på tværs af services (fx `commentservice` ➝ `profanityservice`) uden at tracen “knækker”.  
Vi bruger OpenTelemetry (auto‑instrumenteret i Node) og eksporterer til **Jaeger**.

**Hvad er sat op?**
- Alle services loader `./tracing.js` tidligt i `server.js` (øverst: `require('./tracing')`).
- I `docker-compose.yml` har hver service miljøvariabler:
  ```yaml
  OTEL_SERVICE_NAME: <servicenavn>   # articleservice | commentservice | profanityservice | draftservice
  JAEGER_ENDPOINT: http://jaeger:14268/api/traces
  ```
- En Jaeger‑container kører som en del af compose:
    - UI: <http://localhost:16686>
    - Ingest (HTTP): `jaeger:14268` (til exporter)

**Sådan ser du traces**
1. Åbn **Jaeger UI**: <http://localhost:16686>
2. Vælg en service i *Service*-dropdown (`articleservice`, `commentservice`, `profanityservice`, `draftservice`).
3. Generér trafik, fx:
   ```bash
   # artikelkald (giver DB-spans i articleservice)
   curl -s http://localhost:3000/articles/europe > /dev/null
   curl -s http://localhost:3000/articles/europe > /dev/null

   # kommentar POST (kalder profanityservice; viser cross-service trace)
   curl -s -X POST http://localhost:3001/comments      -H 'Content-Type: application/json'      -d '{"article_id":1,"author":"Ana","content":"Nice article!"}' > /dev/null
   ```
4. Tryk **Find Traces**. Åbn f.eks. *POST /comments* og se spans fra **commentservice** og **profanityservice** i samme trace.
5. (Valgfrit) Brug **Deep Dependency Graph** for et overblik over servicekald.

---
## Endpoints

### ArticleService (port 3000)
- Status: `GET /` → “HappyHeadlines API running 🚀”
- Artikler pr. region:
    - `POST   /articles/:region`      (body: `{ "title": "...", "content": "..." }`)
    - `GET    /articles/:region`
    - `GET    /articles/:region/:id`
    - `PUT    /articles/:region/:id`  (body: `title`, `content`)
    - `DELETE /articles/:region/:id`
- **Metrics**: `GET /metrics` → `{ cache_hits, cache_misses, hit_ratio }`

Eksempel:
```http
POST http://localhost:3000/articles/europe
Content-Type: application/json

{
  "title": "Breaking News Europe",
  "content": "Dette er en testartikel fra Europa"
}
```

### CommentService (port 3001)
- Status: `GET /` → “CommentService running 🚀”
- Kommentarer:
    - `POST   /comments`                (body: `{ "article_id": 1, "author": "Sabrina", "content": "..." }`)
    - `GET    /comments`
    - `GET    /comments/article/:id`
    - `DELETE /comments/:id`
- **Metrics**: `GET /metrics` → `{ cache_hits, cache_misses, hit_ratio }`

---

## Caching & Metrics

### Dashboard
Åbn http://localhost:3000/dashboard for at se et live-dashboard med hit/miss og hit ratio for ArticleService og CommentService.


### ArticleCache (14 dage)
- **Preload** ved opstart og periodisk (job) af artikler fra seneste 14 dage
- **Cache-first**: opslag går først i cachen; ved miss hentes kun 14 dage fra DB og lægges i cache
- **Metrics** på `/metrics` (port 3000)

**Sådan vises det:**
1. Kald to gange:
   ```
   GET http://localhost:3000/articles/europe
   ```
2. Se:
   ```
   GET http://localhost:3000/metrics
   ```
   → `cache_hits` > 0, `hit_ratio` > 0

**Vis at “gamle” artikler ikke kommer med i preload-listen:**
```bash
# backdatér fx id=3 til 60 dage
docker compose exec db_europe psql -U happy_user -d happyheadlines_europe   -c "UPDATE articles SET created_at = NOW() - INTERVAL '60 days' WHERE id = 3;"

# genstart for at preloade igen
docker compose restart articleservice

# nu burde artiklen ikke være med i listen:
curl http://localhost:3000/articles/europe
```

### CommentCache (LRU 30)
- **Cache-miss approach**: første hent fra DB, derefter cache‐hit
- **LRU**: maks **30** `article_id`-nøgler; mindst nyligt brugte smides automatisk ud
- **Metrics** på `/metrics` (port 3001)

**Sådan vises det:**
1. Kald to gange:
   ```
   GET http://localhost:3001/comments/article/1
   ```
2. Se:
   ```
   GET http://localhost:3001/metrics
   ```
   → `cache_hits` > 0


## Projektstruktur
```
microservice-article/
  server.js
  db.js
  routes/articleRoutes.js
  services/articleService.js
  cache.js           # ArticleCache (14 dage)
  metrics.js         # metrics endpoint

microservice-comment/
  server.js
  db.js
  routes/commentRoutes.js
  services/commentService.js
  cache.js           # LRU (max 30)
  metrics.js         # metrics endpoint

docker-compose.yml
README.md
```

---

Sabrina & Mathilde 
