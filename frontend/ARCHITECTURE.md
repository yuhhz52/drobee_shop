# Frontend architecture (Clean Architecture)

React + Vite shop UI organized by layers. Dependencies flow **inward**: UI → hooks → services → core.

## Folder structure

```
src/
├── main.jsx                 # Entry: AppProviders only
├── app/                     # Application shell
│   ├── App.jsx              # Home route content (categories bootstrap)
│   ├── router.jsx           # React Router routes
│   ├── providers/           # Redux + Router providers
│   └── store/               # Redux store, slices, actions
├── core/                    # Framework-agnostic infrastructure
│   ├── config/env.js        # VITE_* env, API_BASE_URL, mock flag
│   └── api/                 # HTTP clients, endpoints, response extractors
├── services/                # API use-cases (one file per domain)
├── hooks/
│   └── api/                 # React hooks wrapping services (+ Redux when needed)
├── features/                # Feature modules (pages + feature-specific UI)
│   ├── home/
│   ├── catalog/
│   ├── cart/
│   ├── auth/
│   ├── navigation/
│   ├── footer/
│   └── ...
├── shared/                  # Reusable UI, utils, global styles
├── data/                    # Static JSON + mocks (no HTTP)
│   ├── mocks/
│   └── static/
└── assets/                  # Images, fonts
```

## Path aliases (vite.config.js)

| Alias        | Path              |
|-------------|-------------------|
| `@`         | `src/`            |
| `@app`      | `src/app/`        |
| `@core`     | `src/core/`       |
| `@services` | `src/services/`   |
| `@hooks`    | `src/hooks/`      |
| `@features` | `src/features/`   |
| `@shared`   | `src/shared/`     |
| `@data`     | `src/data/`       |
| `@assets`   | `src/assets/`     |

## Layer rules

1. **features/** – Pages and feature components. May use `@hooks`, `@services` (prefer hooks), `@app/store`, `@shared`, `@data`, `@assets`. Must not import from other features’ internals; use public paths or move shared code to `@shared`.
2. **hooks/api/** – `useState` / `useEffect` (or callbacks) around services. Dispatch Redux loading/errors when the UI already depends on global state.
3. **services/** – All backend/mock calls. Use `@core/api` clients and `@data/mocks` when `env.useMockData` is true.
4. **core/** – No React, no Redux, no feature imports.
5. **shared/** – No feature imports. Utils and dumb components only.

## Adding a new API

1. Add endpoint in `core/api/endpoints.js` if needed.
2. Implement method in `services/<domain>.service.js`.
3. Export from `services/index.js`.
4. Create `hooks/api/use<Domain>.js` for components.
5. Use the hook in feature pages (avoid calling services directly from JSX when a hook exists).

## Redux

- Store: `@app/store`
- Slices: `@app/store/slices/*.jsx`
- Cart thunks: `@app/store/actions/cartAction`
- Barrel: `@app/store/slices` (named exports)

## Mock data

Set `VITE_USE_MOCK_DATA=true` in `.env`. Product/category services fall back to `@data/mocks/products.mock`.

## Scripts

```bash
npm run dev    # http://localhost:5175
npm run build
```
