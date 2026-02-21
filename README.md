# CommunityHub

CommunityHub is now fully migrated off Supabase to a MongoDB + Express backend with JWT auth.

## Project structure
- `src/` React + React Router frontend
- `server/` Render-ready Node/Express API (TypeScript)

## Local development
1. Install frontend deps: `npm install`
2. Install backend deps: `npm --prefix server install`
3. Start backend: `npm --prefix server run dev`
4. Start frontend: `npm run dev`

## Required env vars
### Frontend (`.env` in repo root)
- `VITE_API_URL=http://localhost:4000`

### Backend (`server/.env` on Render or local shell)
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN=7d`
- `CLIENT_ORIGIN=http://localhost:5173` (or Vercel domain in prod)
- `NODE_ENV=production` (in production)
- `PORT=4000` (Render injects this automatically)

## Key backend endpoints
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/tenants`
- `POST /api/admin/tenants`
- `PUT /api/admin/tenants/:id/status`
- `DELETE /api/admin/tenants/:id`
- `POST /api/plans`
- `GET /api/plans`
- `PUT /api/plans/:id`
- `DELETE /api/plans/:id`
- `POST /api/licenses/generate`
- `GET /api/licenses`
- `PUT /api/licenses/:id/suspend`
- `POST /api/licenses/verify`
- `POST /api/onboarding/claim`
- `GET /api/tenants/public`
- `GET /api/tenants/:slug`
- `GET /api/tenants/:slug/context`
- `POST /api/tenants/:tenantId/join`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/audit`

## Super admin bootstrap
Create or promote super admin from `server/`:
- Create/reset: `npm run seed:super-admin`
- Promote existing by email: `npm run promote:super-admin -- user@example.com`

See `server/README.md` for full Render deployment setup.  
Domain **mycommunityhub.co.za**: see [DOMAINS.md](./DOMAINS.md) for registrar details and Vercel/DNS setup.
