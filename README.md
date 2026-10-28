# Exhibition screens
- frontend: electron + vite
- backend: express
- shared: Zod schemas and inferred TypeScript models used by both apps

## Setup
- node 24
- npm 11
- `npm ci` in repo root

## Development
Run both:
```sh
npm run dev
```

Run separately:
```sh
npm run dev:frontend
npm run dev:backend
```

## Env

- `PORT`
- `CONTENT_DIR` (backend)
- `EXHIBITION_BACKEND_URL` (frontends base url)
- `FULLSCREEN`
