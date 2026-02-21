# Vercel Frontend Deployment

## Environment variable
Set in Vercel project settings:
- `VITE_API_URL=https://<your-render-service>.onrender.com`

## Build settings
- Build command: `npm run build`
- Output directory: `dist`

## CORS
Ensure backend `CLIENT_ORIGIN` exactly matches your Vercel domain.

## Post-deploy check
1. Open app and log in.
2. Confirm `/super-admin` loads for SUPER_ADMIN.
3. Confirm `/health` on Render returns 200.
