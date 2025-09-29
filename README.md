# HappyHeadlines - Distributed Article Service

Dette projekt implementerer en **REST-baseret ArticleService**, som kan udføre CRUD-operationer (Create, Read, Update, Delete) på artikler.  
Systemet er designet til at demonstrere **microservice-arkitektur**, **x-axis split** og **z-axis split**.

---

## Arkitektur

### 1. ArticleService (X-axis split)
- ArticleService implementeres som en **REST API** i Node.js/Express.
- API’et tilbyder CRUD-endpoints til artikler:
  - `POST /articles/:region` → opret artikel i en given region
  - `GET /articles/:region` → hent alle artikler fra en given region
  - `GET /articles/:region/:id` → hent en specifik artikel
  - `PUT /articles/:region/:id` → opdater en artikel
  - `DELETE /articles/:region/:id` → slet en artikel
- Servicen kører i **3 instanser** bag en Docker Swarm load balancer.  
  Det betyder, at forespørgsler automatisk fordeles mellem instanserne.

### 2. ArticleDatabase (Z-axis split)
For at håndtere global og regional opdeling af data, er databasen **shardet pr. region**:

- `db_africa`
- `db_antarctica`
- `db_asia`
- `db_europe`
- `db_northamerica`
- `db_oceania`
- `db_southamerica`
- `db_global`

Hver database kører som en selvstændig PostgreSQL-container.  
Artikler oprettes i den database, som matcher `region`-parameteren i requestet.

---

## Teknologier

- **Node.js / Express** → REST API
- **PostgreSQL** → Databasesystem
- **Docker & Docker Swarm** → Containerisering, clustering og load balancing
- **pg (node-postgres)** → Database client
- **Postman** → Test af API

---

## Projektstruktur og forklaring af filer

```
happyheadlines/
│
├── server.js               
│   # Opsætter Express serveren, registrerer routes og starter API’et på port 3000.
│
├── db.js                   
│   # Indeholder connection pools til PostgreSQL. 
│   # Har en funktion getPool(region), der vælger den rigtige database baseret på region.
│
├── services/
│   └── articleService.js   
│       # Indeholder logikken for CRUD-operationer. 
│       # Funktionerne bruger getPool(region) til at vælge den rigtige database.
│
├── routes/
│   └── articleRoutes.js    
│       # Definerer alle API endpoints (CRUD). 
│       # Kalder metoder fra articleService.js og sender response tilbage til klienten.
│
├── docker-compose.yml      
│   # Opretter 8 PostgreSQL-databaser (kontinent + global).
│   # Opretter 3 replikaer af ArticleService for x-axis skalering.
│
└── README.md               
    # Dokumentation (denne fil).
```

---

## Sådan kører du projektet

### 1. Byg og deploy
```bash
docker build -t happyheadlines-articleservice .
docker stack deploy -c docker-compose.yml happyheadlines
```

Dette opretter:
- 3 instanser af `happyheadlines_articleservice`
- 8 PostgreSQL-databaser (1 pr. kontinent + global)

### 2. Verificer services
```bash
docker service ls
```

Du burde se:
- `happyheadlines_articleservice` (3/3 replicas)
- `happyheadlines_db_europe`, `happyheadlines_db_asia`, osv. (alle 1/1)

---

## Test af API i Postman

Vi har testet CRUD-operationerne på forskellige regioner:

### Create (POST)
```http
POST http://localhost:3000/articles/europe
Content-Type: application/json

{
  "title": "Breaking News Europe",
  "content": "Dette er en testartikel fra Europa"
}
```

### Read all (GET)
```http
GET http://localhost:3000/articles/europe
```

### Read one (GET)
```http
GET http://localhost:3000/articles/europe/1
```

### Update (PUT)
```http
PUT http://localhost:3000/articles/europe/1
Content-Type: application/json

{
  "title": "Updated Europe Title",
  "content": "Dette er en opdateret artikel"
}
```

### Delete (DELETE)
```http
DELETE http://localhost:3000/articles/europe/1
```

---

## Load balancing test
For at se load balancing i aktion:
```bash
docker service ps happyheadlines_articleservice
```

Send mange requests hurtigt (fx med Postman Runner eller `ab`):
```bash
ab -n 50 -c 10 http://localhost:3000/articles/europe
```

Requests fordeles mellem de 3 instanser af ArticleService.

---

## Konklusion
Dette projekt viser:
- **CRUD endpoints** til artikler (REST API)
- **X-axis split** med load balancing (3 ArticleService instanser)
- **Z-axis split** med 8 PostgreSQL-databaser (kontinenter + global)
- Fuldt testet via Postman (Create, Read, Update, Delete fungerer)

Systemet kan skaleres horisontalt og vertikalt, og det demonstrerer en distribueret arkitektur, hvor både services og data er shardet.


- Sabrina og Mathilde