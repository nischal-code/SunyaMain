# Sunya Frontend

React 19 + Vite frontend scaffold for the Sunya backend (Phase 2C-6).

This is the **initial setup only** — auth wiring and routing skeleton. No
feature pages or business-logic components have been built yet.

## What's included

```
src/
├── main.jsx              # React entry point
├── App.jsx                # BrowserRouter + AuthProvider + AppRoutes
├── index.css               # Base/reset styles
├── api/
│   └── axiosClient.js      # Axios instance, token storage, refresh interceptor
├── routes/
│   ├── AppRoutes.jsx        # Route table (placeholder pages for now)
│   ├── ProtectedRoute.jsx   # Requires an authenticated user
│   ├── PublicRoute.jsx      # Requires NO authenticated user (login, etc.)
│   └── RoleBasedRoute.jsx   # Requires one of a whitelisted set of roles
├── context/
│   └── AuthContext.jsx      # Auth state: user, login, logout, session restore
└── hooks/
    └── useAuth.js            # useContext(AuthContext) convenience hook
```

## How auth works

The backend (`/api/v1/auth`) issues:
- An `accessToken` — returned in the JSON response body **and** set as an
  httpOnly cookie. This app stores the body copy in memory + `localStorage`
  and sends it as `Authorization: Bearer <token>` on every request.
- A `refreshToken` — set only as an httpOnly cookie (`credentials: true` /
  `withCredentials: true` lets the browser send it automatically; JS never
  reads it directly).

Flow:
1. On app load, `AuthContext` silently calls `POST /auth/refresh-token`
   (cookie-based) to mint a fresh access token, then `GET /auth/me` to load
   the user. If either fails, the user is simply treated as logged out.
2. `axiosClient` attaches the in-memory access token to every request.
3. If any request gets a `401`, the response interceptor automatically
   calls `/auth/refresh-token` once, retries the original request, and
   queues any other requests that failed at the same time. If the refresh
   itself fails, the user is logged out locally.

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

The backend must have `CLIENT_URL` set to this app's origin (e.g.
`http://localhost:5173`) and CORS `credentials: true` (already configured
in `app.js`) for cookies to flow correctly.

## Next steps

- Build out `pages/`, `components/`, `layouts/`, `store/`, `sockets/` per
  the planned folder structure.
- Replace the placeholder elements in `AppRoutes.jsx` with real pages as
  they're built.
- Add `auth.api.js` (and the other `api/*.api.js` modules) once you're
  ready to wire up feature-specific requests on top of `axiosClient`.
