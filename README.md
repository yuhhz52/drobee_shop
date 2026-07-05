<div align="center">

  <a href="https://horizonshop.io.vn">
    <div>HORIZONSHOP</div>
  </a>

  <h1 align="center">HorizonShop</h1>

  <p align="center">
    A full-stack e-commerce platform for premium electric scooters — production-ready
    with Spring Boot 3, React 19, Stripe + VNPay, OAuth2 Google, and a Cloudflare/DNS-friendly
    custom domain (<code>horizonshop.io.vn</code>).
    <br />
    <a href="https://horizonshop.io.vn"><strong>Live Demo »</strong></a>
    ·
    <a href="https://github.com/your-username/scooter/issues">Report Bug</a>
    ·
    <a href="https://github.com/your-username/scooter/issues">Request Feature</a>
  </p>
</div>

<div align="center">

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Java][java-shield]][java-url]
[![Spring Boot][spring-shield]][spring-url]
[![React][react-shield]][react-url]
[![Vite][vite-shield]][vite-url]

</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#highlights">Highlights</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#quick-start-with-docker">Quick Start (Docker)</a></li>
        <li><a href="#manual-local-development">Manual Local Development</a></li>
        <li><a href="#environment-variables">Environment Variables</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li>
      <a href="#deployment">Deployment</a>
    </li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#api-surface">API Surface</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

---

## About The Project

**Drobee / HorizonShop** is a complete e-commerce platform specialised in
**premium electric scooters** (Kukirin, Dualtron, Teverun, Rovoron, Kuickwheel…).
The codebase ships two production-ready applications inside one monorepo:

| Layer    | Stack                                              | Role                                                                 |
| -------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| Frontend | React 19 · Vite 6 · Redux Toolkit · MUI 7 · Tailwind 4 | Customer-facing store, cart, checkout, account portal, admin SPA  |
| Backend  | Spring Boot 3.5 · Java 21 · JPA · Flyway · Spring Security | REST API, JWT auth, payments, scheduler jobs, admin endpoints |

> The whole system targets a **managed cloud deployment** (no self-hosted CI):
> Supabase (Postgres), Upstash (managed Redis), Railway (backend JAR), Vercel
> (frontend static build). You can bring it up with **zero** Docker on your
> laptop and **zero** GitHub Actions in production.

### Highlights

- 🛒 **Storefront & Cart** — anonymous-cart cookie sessions, login-magic merge
  on sign-in, multi-variant products with stock, color/size/spec filters,
  range slider, price filter, multilingual copy (EN/VI).
- 🔐 **Auth** — JWT (access + refresh) with Redis-backed token blacklist,
  Google OAuth2, email verification, BCrypt, replay protection
  (`X-Idempotency-Key` on every mutation).
- 💳 **Payments** — Stripe (international cards), VNPay (domestic gateway),
  Cart-based and Buy-Now flows, abandoned-order scheduler restores stock.
- 🧑‍💼 **Admin** — protected routes (`ROLE_ADMIN`), product CRUD, categories,
  banners, orders, user list, file uploads, react-admin ready.
- 🌍 **i18n** — built-in `I18nProvider` + `useTranslation`, ships with full
  `en.json` / `vi.json` dictionaries, persisted in `localStorage`.
- 🛡️ **Hardening** — Bucket4j rate-limit filter (login/checkout/cart),
  CSRF-safe cookie sessions, same-site OAuth2 cookies, helmet-grade headers,
  central `GlobalExceptionHandler` + `ErrorCode` enum.
- 📈 **Observability** — Spring Actuator (`/actuator/health`, `/metrics`,
  Prometheus, liveness/readiness probes), structured logs, request tracing.
- 🚀 **Deploy** — Railway (Dockerfile multi-stage), Vercel (`vercel.json`),
  Supabase + Upstash-managed services, no CI/CD pipeline required.

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

#### Frontend

* [![React][react-shield]][react-url]
* [![Vite][vite-shield]][vite-url]
* [![Redux][redux-shield]][redux-url]
* [![MUI][mui-shield]][mui-url]
* [![Tailwind][tailwind-shield]][tailwind-url]
* [![Axios][axios-shield]][axios-url]
* [![React Router][router-shield]][router-url]
* [![react-admin][ra-shield]][ra-url]

#### Backend

* [![Java][java-shield]][java-url] (JDK 21)
* [![Spring Boot][spring-shield]][spring-url]
* [![Spring Security][security-shield]][security-url]
* [![Hibernate][hibernate-shield]][hibernate-url]
* [![Flyway][flyway-shield]][fly-url]
* [![JWT][jwt-shield]][jwt-url]
* [![Stripe][stripe-shield]][stripe-url]
* [![PostgreSQL][postgres-shield]][postgres-url]
* [![Redis][redis-shield]][redis-url]

#### Tooling

* [![Maven][maven-shield]][maven-url]
* [![npm][npm-shield]][npm-url]
* [![Docker][docker-shield]][docker-url]
* [![Railway][railway-shield]][railway-url]
* [![Vercel][vercel-shield]][vercel-url]
* [![Supabase][supabase-shield]][supabase-url]
* [![Upstash][upstash-shield]][upstash-url]

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Getting Started

Clone the repo and pick **one** of the two local paths below: Docker (easiest)
or manual split (closest to production).

### Prerequisites

You need **either** Docker, **or** both toolchains locally:

- [Docker Desktop](https://www.docker.com/products/docker-desktop) **and**
  [Docker Compose v2](https://docs.docker.com/compose/) (recommended)
- *Or:* JDK 21 · Maven 3.9+ · Node.js 20+ · PostgreSQL 16 · Redis 7

A SMTP mail account, a Stripe test key, and a VNPay sandbox account are
optional for full feature coverage but required for payment flows.

### Quick Start (Docker)

> One command brings up Postgres, Redis, the backend JAR, and the Nginx
> frontend — all wired together on a private bridge network.

```sh
# 1. Copy the root template and fill in your secrets
cp .env.example .env

# 2. Spin everything up (first run takes a few minutes for Maven/Node)
docker compose up -d --build

# 3. Watch logs until you see "Started ShopecomApplication"
docker compose logs -f backend
```

Once both services report healthy:

| Service     | URL                            |
| ----------- | ------------------------------ |
| Storefront  | http://localhost:5175          |
| REST API    | http://localhost:8080          |
| Swagger UI  | http://localhost:8080/v1/docs  |
| Actuator    | http://localhost:8080/actuator |

To **tear it all down** (keep volumes):

```sh
docker compose down
```

To **nuke state** (drop Postgres + Redis volumes):

```sh
docker compose down -v
```

### Manual Local Development

Use this path if you want a hot-reload experience that mirrors production
(Railway/Vercel):

#### Terminal 1 — Backend (Spring Boot)

```sh
cd backend
cp .env.example .env          # then edit values
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

The backend expects a real Postgres + Redis. The fastest way:

```sh
docker run -d --name shop-pg     -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
docker run -d --name shop-redis  -p 6379:6379 redis:7-alpine
```

Then set in `backend/.env`:

```env
DB_URL=jdbc:postgresql://localhost:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
```

Flyway will auto-run every migration in `src/main/resources/db/migration`
on first boot.

#### Terminal 2 — Frontend (Vite)

```sh
cd frontend
cp .env.example .env          # set VITE_API_BASE_URL=http://localhost:8080
npm install
npm run dev
```

Vite is configured with `@`-style aliases (`@features`, `@shared`, `@app`, …)
and a proxy that forwards `/api/**` to the backend, so the frontend can
talk to it cross-origin-free during development.

### Environment Variables

> **Never commit real secrets.** Both `.env*` files are git-ignored except
> the `.example` variants. Keep your production values in the deployment
> platform's UI, not the repo.

#### Root `.env` (used by `docker-compose.yml`)

| Variable          | Required | Example                                | Notes                          |
| ----------------- | -------- | -------------------------------------- | ------------------------------ |
| `POSTGRES_DB`     | yes      | `shopecom`                             | Bootstraps the Postgres image  |
| `POSTGRES_USER`   | yes      | `postgres`                             |                                |
| `POSTGRES_PASSWORD` | yes    | `change-me`                            |                                |
| `POSTGRES_PORT`   | no       | `5432`                                 |                                |
| `REDIS_PORT`      | no       | `6379`                                 |                                |
| `REDIS_PASSWORD`  | no       | *(empty)*                              |                                |
| `SERVER_PORT`     | no       | `8080`                                 |                                |
| `FRONTEND_PORT`   | no       | `5175`                                 |                                |

#### `backend/.env` (and `.env.production`)

Spring Boot reads these via the [`spring-dotenv`](https://github.com/paulschwarz/spring-dotenv)
plugin. See [`backend/.env.production`](backend/.env.production) for the
production-shaped template.

| Group        | Variable(s)                                                                        |
| ------------ | ---------------------------------------------------------------------------------- |
| Database     | `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`                                             |
| Redis        | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TLS`                          |
| Mail (SMTP)  | `MAIL_USERNAME`, `MAIL_PASSWORD`                                                    |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                         |
| JWT          | `JWT_AUTH_SECRET`, `JWT_REFRESH_SECRET`                                            |
| App URLs     | `APP_URL`, `APP_BASE_URL`, `ORDER_CONFIRMED_URL`, `APP_OAUTH2_REDIRECT_URI`        |
| CORS         | `APP_CORS_ORIGINS` (comma-separated)                                              |
| Cookies      | `APP_COOKIE_DOMAIN`, `APP_COOKIE_SAMESITE`, `APP_COOKIE_SECURE`                    |
| Stripe       | `STRIPE_SECRET`                                                                    |
| VNPay        | `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_PAY_URL`, `VNPAY_RETURN_URL`         |
| Uploads      | `UPLOAD_DIR` (`uploads` by default)                                                |

#### `frontend/.env`

| Variable               | Default                          | Notes                            |
| ---------------------- | -------------------------------- | -------------------------------- |
| `VITE_API_BASE_URL`    | `http://localhost:8080`          | Empty string → relative URLs     |
| `VITE_STRIPE_PUBLIC_KEY` | *(empty)*                      | Publishable key for Stripe.js   |

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Usage

Walk through the store from a clean DB:

```sh
# 1. Make sure both services are running (Docker or manual)
docker compose ps            # → both postgres & redis must be "healthy"

# 2. Apply Flyway seed data (auto-runs on backend start)
docker compose logs backend | grep "Started ShopecomApplication"

# 3. Open the store and the admin
open http://localhost:5175                # storefront
open http://localhost:5175/admin          # react-admin (login as seeded admin)
```

Default local credentials are seeded by Flyway (`V901__seed_full.sql`);
in **production** these are disabled — create your admin via the registration
flow or directly in `psql`.

The storefront accepts guest carts, anonymous checkout, Google OAuth, and
email/verification-code registration. Toggle the language from the footer
(EN/VI) and reload — the choice persists in `localStorage`.

### Useful npm scripts (frontend)

```sh
npm run dev        # vite dev server on :5175 with HMR
npm run build      # production bundle into ./dist
npm run preview    # serve the production bundle locally
npm run lint       # eslint with the React + hooks plugins
```

### Useful Maven tasks (backend)

```sh
./mvnw spring-boot:run                            # local dev
./mvnw clean package -DskipTests                  # build the JAR
./mvnw test                                       # unit tests
./mvnw flyway:migrate                             # apply DB migrations
./mvnw spring-boot:build-image                    # build the OCI image
```

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Deployment

> **No CI/CD.** Both targets pick up the latest commit on push (Railway watches
> the `backend/` subdirectory, Vercel reads `vercel.json` at the repo root).
> Promotion is purely **commit → push → auto-deploy**.

Topology you'll end up with:

```
                           ┌──────────────────────────────┐
                           │     horizonshop.io.vn        │
                           │   (Vercel static frontend)   │
                           └──────────────┬───────────────┘
                                          │  HTTPS /api/*
                                          ▼
                           ┌──────────────────────────────┐
                           │   api.horizonshop.io.vn      │
                           │  (Railway backend container) │
                           └───────┬─────────────┬────────┘
                                   │             │
                          JDBC over │             │ Lettuce TLS
                                   ▼             ▼
              ┌──────────────────────┐  ┌──────────────────────┐
              │ Supabase Pooler (5432)│  │ Upstash Redis (TLS)  │
              └──────────────────────┘  └──────────────────────┘
```

At your DNS provider (Cloudflare, TuanHost, vHost, etc.) add:

| Type  | Name                     | Value / Target                                  | Proxy       |
| ----- | ------------------------ | ----------------------------------------------- | ----------- |
| `A`   | `horizonshop.io.vn`      | Vercel IP (`76.76.21.21`)                       | DNS only    |
| `CNAME` | `www.horizonshop.io.vn`| `cname.vercel-dns.com`                          | DNS only    |
| `CNAME` | `api.horizonshop.io.vn`| `<container>-<hash>.up.railway.app` (Railway CNAME) | DNS only |

After propagation:

- `https://horizonshop.io.vn` — Vercel SPA
- `https://api.horizonshop.io.vn` — Railway container
- `https://horizonshop.io.vn/v1/docs` — bundled Swagger UI

> Don't forget to whitelist the production origins in
> `APP_CORS_ORIGINS` (already set in `backend/.env.production`).

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Project Structure

```text
scooter/
├── backend/                         # Spring Boot 3 / Java 21
│   ├── src/main/java/com/yuhecom/shopecom
│   │   ├── ShopecomApplication.java # @EnableScheduling + @EnableAsync
│   │   ├── auth/                    # JWT, OAuth2 Google, registration, blacklist
│   │   ├── config/                  # rate-limit, CSRF, AppProperties, Swagger
│   │   ├── controller/              # REST controllers
│   │   ├── dto/                     # request/response payloads
│   │   ├── entity/                  # JPA entities (Product, Order, Cart…)
│   │   ├── exception/               # GlobalExceptionHandler, ErrorCode
│   │   ├── mapper/                  # MapStruct DTO ↔ Entity
│   │   ├── repository/              # Spring Data JPA repositories
│   │   ├── scheduler/               # abandoned order + cart cleanup jobs
│   │   ├── service/ (+ impl/)       # business logic, Stripe, VNPay
│   │   └── specification/           # JPA criteria / query specs
│   ├── src/main/resources
│   │   ├── application*.yaml        # default + docker + production profiles
│   │   ├── db/migration/V9xx__*.sql # Flyway schema + seed migrations
│   │   └── static/                  # served at /
│   ├── Dockerfile                   # multi-stage Temurin build → JRE runtime
│   └── pom.xml
├── frontend/                        # React 19 + Vite 6 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.jsx              # bootstrap page (HomeScooter)
│   │   │   ├── providers/           # Redux, theme, I18nProvider
│   │   │   ├── router.jsx           # createBrowserRouter
│   │   │   └── store/               # Redux slices (cart, auth, user, …)
│   │   ├── core/api/                # axios clients, CSRF, endpoint map
│   │   ├── core/config/env.js       # Vite env reader
│   │   ├── data/                    # static mocks + content.json
│   │   ├── features/
│   │   │   ├── account/             # Profile, Orders, Addresses
│   │   │   ├── admin/               # react-admin SPA
│   │   │   ├── auth/                # Login, Register, VerifyCode, OAuth2 callback
│   │   │   ├── cart/                # Cart page
│   │   │   ├── catalog/             # PLP, PDP, filters, drawrers
│   │   │   ├── checkout/            # CartCheckout, BuyNowCheckout, Stripe payment
│   │   │   ├── contact/             # Contact page
│   │   │   ├── footer/              # Footer with language switcher
│   │   │   ├── home/                # HomeScooter + 14 sub-sections
│   │   │   ├── navigation/          # top nav with dropdowns
│   │   │   ├── order/               # order-confirmed display
│   │   │   ├── payment/             # Payment + Stripe return handler
│   │   │   └── shop/                # generic shop pages (shops)
│   │   ├── shared/
│   │   │   ├── components/          # Carousel, Filters, Hero, Timeline, …
│   │   │   ├── i18n/                # I18nProvider, useTranslation, en/vi dicts
│   │   │   ├── styles/              # global CSS, modal.js
│   │   │   └── utils/               # price-format, jwt-helper, slug, …
│   │   ├── hooks/api/               # useAuth, useProducts, useCategories…
│   │   ├── services/                # axios-backed API services
│   │   └── main.jsx                 # React root mount
│   ├── Dockerfile                   # Node build → nginx static
│   ├── nginx.conf                   # SPA-friendly try_files
│   ├── vercel.json                  # SPA rewrite → index.html
│   └── package.json
├── docker-compose.yml               # postgres + redis + backend + frontend
├── .env.example                     # template for Docker secrets
├── .github/                         # local agent hooks (not CI)
└── README.md                        # ← you are here
```

> **Conventions**
> - Backend package is strictly `repository` (never `reponsitory`); add new
>   JPA repositories inside `com.yuhecom.shopecom.repository`.
> - Frontend aliases (`@features`, `@shared`, `@app`, `@hooks`, `@services`,
>   `@core`, `@data`, `@assets`) are enforced by `vite.config.js`.
> - Conventional Commits in English: `feat:`, `fix:`, `refactor:`, `docs:`,
>   `chore:`, `test:`.

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Roadmap

- [x] Storefront with PLP, PDP, color/size/spec filters, range slider
- [x] Anonymous-cart cookie + merge-on-login
- [x] JWT auth (access + refresh) with Redis blacklist
- [x] Google OAuth2 + email/verification registration
- [x] Stripe (international) + VNPay (domestic) payment flows
- [x] Cart-based *and* Buy-Now checkout with `X-Idempotency-Key`
- [x] Vietnam region address book (province / ward)
- [x] Admin SPA for products, categories, banners, orders, users, files
- [x] i18n with EN / VI dictionaries persisted in `localStorage`
- [x] Rate limiting + CSRF-safe cookie sessions
- [x] Flyway-managed schema migrations
- [x] Scheduled jobs (abandoned orders, anonymous-cart expiry)
- [x] Spring Actuator (health, Prometheus metrics)
- [x] Swagger UI / OpenAPI 3 documentation
- [x] Railway + Vercel deployment, zero CI/CD
- [x] Supabase + Upstash managed services
- [ ] Product reviews + ratings
- [ ] Wishlist persistence across devices
- [ ] Background image optimisation / responsive srcset
- [ ] Web push notifications for abandoned-cart recovery

See the [open issues][issues-url] for a full list of proposed features
(and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Contributing

Contributions make the open-source community such an amazing place to learn,
inspire and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes using [Conventional Commits](https://www.conventionalcommits.org/)
   (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request back to `main`

### Top contributors
Yuhhz52
<p align="right">(<a href="#top">back to top</a>)</p>

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.
(If you prefer a different license — Unlicense, Apache-2.0, GPL-3.0 — change
this section accordingly.)

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Contact

Project Link: [https://github.com/your-username/scooter](https://github.com/your-username/scooter)
Production: [https://horizonshop.io.vn](https://horizonshop.io.vn)

<p align="right">(<a href="#top">back to top</a>)</p>

---

## Acknowledgments

* [Best-README-Template](https://github.com/othneildrew/Best-README-Template)
  by Othneil Drew — the template this README is built on.
* [Spring Boot Reference](https://spring.io/projects/spring-boot)
* [Vite](https://vitejs.dev/) & [React](https://react.dev/)
* [react-admin](https://marmelab.com/react-admin/) — admin SPA scaffolding.
* [Stripe](https://stripe.com/docs) & [VNPay](https://sandbox.vnpayment.vn/) —
  payment integrations.
* [Supabase](https://supabase.com/docs), [Upstash](https://docs.upstash.com/),
  [Railway](https://docs.railway.app/), [Vercel](https://vercel.com/docs) —
  managed-cloud foundations.
* [Img Shields](https://shields.io) for the badge set.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/your-username/scooter.svg?style=for-the-badge
[contributors-url]: https://github.com/your-username/scooter/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/your-username/scooter.svg?style=for-the-badge
[forks-url]: https://github.com/your-username/scooter/network/members
[stars-shield]: https://img.shields.io/github/stars/your-username/scooter.svg?style=for-the-badge
[stars-url]: https://github.com/your-username/scooter/stargazers
[issues-shield]: https://img.shields.io/github/issues/your-username/scooter.svg?style=for-the-badge
[issues-url]: https://github.com/your-username/scooter/issues
[license-shield]: https://img.shields.io/github/license/your-username/scooter.svg?style=for-the-badge
[license-url]: https://github.com/your-username/scooter/blob/master/LICENSE

[java-shield]: https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white
[java-url]: https://openjdk.org/projects/jdk/21/
[spring-shield]: https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white
[spring-url]: https://spring.io/projects/spring-boot
[security-shield]: https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=spring-security&logoColor=white
[security-url]: https://spring.io/projects/spring-security
[hibernate-shield]: https://img.shields.io/badge/Hibernate-59666C?style=for-the-badge&logo=hibernate&logoColor=white
[hibernate-url]: https://hibernate.org/
[flyway-shield]: https://img.shields.io/badge/Flyway-CC0200?style=for-the-badge&logo=flyway&logoColor=white
[fly-url]: https://flywaydb.org/
[jwt-shield]: https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white
[jwt-url]: https://jwt.io/
[stripe-shield]: https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white
[stripe-url]: https://stripe.com/
[postgres-shield]: https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white
[postgres-url]: https://www.postgresql.org/
[redis-shield]: https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white
[redis-url]: https://redis.io/
[maven-shield]: https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white
[maven-url]: https://maven.apache.org/

[react-shield]: https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black
[react-url]: https://react.dev/
[vite-shield]: https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white
[vite-url]: https://vitejs.dev/
[redux-shield]: https://img.shields.io/badge/Redux%20Toolkit-764ABC?style=for-the-badge&logo=redux&logoColor=white
[redux-url]: https://redux-toolkit.js.org/
[mui-shield]: https://img.shields.io/badge/MUI-7-007FFF?style=for-the-badge&logo=mui&logoColor=white
[mui-url]: https://mui.com/
[tailwind-shield]: https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white
[tailwind-url]: https://tailwindcss.com/
[axios-shield]: https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white
[axios-url]: https://axios-http.com/
[router-shield]: https://img.shields.io/badge/React%20Router-7-CA4245?style=for-the-badge&logo=react-router&logoColor=white
[router-url]: https://reactrouter.com/
[ra-shield]: https://img.shields.io/badge/react--admin-5-20B2AA?style=for-the-badge&logo=marmelab&logoColor=white
[ra-url]: https://marmelab.com/react-admin/

[npm-shield]: https://img.shields.io/badge/npm-11-CB3837?style=for-the-badge&logo=npm&logoColor=white
[npm-url]: https://www.npmjs.com/
[docker-shield]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[docker-url]: https://www.docker.com/
[railway-shield]: https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white
[railway-url]: https://railway.com/
[vercel-shield]: https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white
[vercel-url]: https://vercel.com/
[supabase-shield]: https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white
[supabase-url]: https://supabase.com/
[upstash-shield]: https://img.shields.io/badge/Upstash-00E9A3?style=for-the-badge&logo=upstash&logoColor=black
[upstash-url]: https://console.upstash.com/
