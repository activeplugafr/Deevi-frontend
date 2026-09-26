# Deevi frontend

The Next.js frontend for **Deevi**, a two-sided local-services marketplace for Nigeria.
Customers post jobs, verified artisans apply, the customer chooses, they chat, the work gets
done, and the customer leaves a review.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (design tokens in `app/globals.css`)
- Talks to the Deevi NestJS backend (see `swagger.json`) — the backend is the source of truth.

## Getting started

```bash
cp .env.example .env.local   # then set DEEVI_API_URL if your backend isn't on :3001
npm install
npm run dev                  # http://localhost:3000
```

The browser never calls the backend directly. Next.js proxies `/bff/*` to `DEEVI_API_URL/*`
(see `next.config.ts`), which removes CORS and keeps the backend URL server-side.

## Environment

| Variable            | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `DEEVI_API_URL`     | Base URL of the Deevi backend (proxied via `/bff`).  |
| `NEXT_PUBLIC_APP_URL`| Public app URL, used for OAuth redirects.           |

## Project layout

```
app/
  (auth)/         login, signup, forgot-password
  (customer)/     home, jobs (+ new wizard, detail), messages, artisans, profile, settings
  artisan/        feed (verification-gated), onboarding, jobs, applications, active, profile
  admin/          dashboard, verification, users, jobs, reports, catalogue
components/        ui/ (design system), layout/, jobs/, artisan/, messaging/, shared/, admin/
lib/
  api/            HTTP client (+ auto token refresh) and typed per-domain API clients
  auth/           session store + AuthProvider/useAuth (roles: CUSTOMER/ARTISAN/ADMIN)
  types.ts        types derived from the backend OpenAPI contract
  errors.ts       backend error `code` → human-readable UI copy
  hooks.ts        useAsync / usePaginated / useDebounced
```

## Scripts

```bash
npm run dev       # dev server
npm run build     # production build
npm run start     # serve the production build
npm run lint      # eslint
```

## Scope

This build matches the current lean backend MVP. Dormant/future features (payments, boosts,
subscriptions, AI matching, live tracking) are intentionally **not** built — `GET /health`
lists what's dormant. Deevi does not process job payments; customers and artisans settle
directly (`payment_mode: OFFLINE`).
