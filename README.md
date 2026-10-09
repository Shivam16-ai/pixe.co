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

## Deploy on Fly.io

The Express server serves the frontend, API, and Socket.IO from one origin. Do
not deploy only the static `dist` folder: it does not include the API. The Fly
configuration keeps the SQLite database and uploaded images on a persistent
volume and probes `/api/health`.

1. Install `flyctl`, sign in with `fly auth login`, and replace the example
   `app` name in `fly.toml` with a globally unique Fly app name. Set `APP_URL`
   and `FRONTEND_URL` in the same file to `https://<app-name>.fly.dev`.
2. Create the app and its persistent volume in the configured region:
   ```sh
   fly apps create <app-name>
   fly volumes create pixe_data --region bom --size 1 --app <app-name>
   ```
3. Set a strong JWT secret and admin password as Fly secrets (do not commit
   these values):
   ```sh
   fly secrets set JWT_SECRET="<long-random-secret>" ADMIN_PASSWORD="<strong-admin-password>" --app <app-name>
   ```
4. Deploy the app:
   ```sh
   fly deploy --app <app-name>
   ```
   On first startup, the app initializes the schema on the empty persistent
   database volume. Existing databases are not automatically migrated.
5. Seed the admin and sample data on the running machine:
   ```sh
   fly ssh console --app <app-name> -C "npm run db:seed"
   ```
6. Open `https://<app-name>.fly.dev`. Use the `ADMIN_EMAIL` (defaults to
   `admin@pixe.co`) and `ADMIN_PASSWORD` secret to sign in as admin.

For this single-origin deployment, leave `VITE_API_BASE_URL` empty. The
frontend, API, and login cookie will all use the Fly HTTPS domain. The
preconfigured SQLite volume is intended for a single Fly machine; back it up
regularly and do not scale this setup to multiple machines.

### Google sign-in

Configure the OAuth client in Google Cloud Console with the app's origin as an
authorized JavaScript origin and
`https://<app-name>.fly.dev/api/auth/google/callback` as an authorized redirect
URI. For local development, use `http://localhost:3000` and
`http://localhost:3000/api/auth/google/callback`.

For Fly, set the client ID, rotated client secret, and exact callback URL as
server secrets:

```sh
fly secrets set GOOGLE_CLIENT_ID="<client-id>" GOOGLE_CLIENT_SECRET="<rotated-client-secret>" GOOGLE_CALLBACK_URL="https://<app-name>.fly.dev/api/auth/google/callback" --app <app-name>
```

Restart/redeploy after updating these settings. The Google client secret must
only be configured on the backend and must never be committed or included in
frontend `VITE_` variables. Google sign-in creates customer accounts; admin
accounts must continue to use password sign-in.
