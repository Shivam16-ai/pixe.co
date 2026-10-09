# PIXÉ.CO

## Run locally

Prerequisites: Node.js and npm.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set at least `JWT_SECRET` and `ADMIN_PASSWORD`.
3. Generate the Prisma client and initialize the database:
   ```sh
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```
4. Start the app with `npm run dev` and open http://localhost:3000.

After seeding, the sample customer account is `collector@pixe.co` with password
`archival2026!`. The admin account uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from
`.env` (the email defaults to `admin@pixe.co`). Change the sample credentials
before using seeded accounts in a publicly accessible deployment.

## Deployment

The app requires its Express/Socket.IO server and database; deploying only the
static `dist` files will leave API requests unavailable. The simplest setup is
to build and run the app on one Node.js host (`npm run build`, then `npm start`),
with the database and secrets configured on that host. Keep the frontend and
backend on the same origin when possible.

If hosting the frontend separately, set `VITE_API_BASE_URL` to the backend
origin when building the frontend, and set `FRONTEND_URL` on the backend to the
frontend origin. The frontend host must also rewrite app routes such as `/login`
to `index.html` (SPA fallback). Use HTTPS for production authentication cookies.
