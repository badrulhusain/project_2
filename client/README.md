# EventSense client

Next.js 16 App Router client for the EventSense NestJS API. The public site lets attendees discover events, book seats, preorder food, reserve parking, and keep QR tickets. The organizer studio covers event setup, the live planner, attendees, notifications, scanning, and reports.

## Run locally

Start the API first; see [`../server/README.md`](../server/README.md). The API uses port 3002. Then:

```powershell
cd client
Copy-Item .env.example .env.local
npm install
npm run dev -- --port 3001
```

Open `http://localhost:3001`. The Neon development database is currently empty by request. Register a new attendee, and use the organizer code configured in the API to register an admin. The demo accounts only exist if you explicitly run `npm run db:seed` in `server`.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | NestJS base URL including `/api`, default `http://localhost:3002/api` |

JWTs are issued by the API and held in a Next.js `httpOnly`, `sameSite=lax` cookie. The cookie is `secure` in production, so serve the production client over HTTPS. Client components call the local `/api/backend` proxy, which adds the bearer token on the server. `proxy.ts` performs quick route redirects; protected server layouts also verify the user and role with the API.

Cloudinary uploads use a signed direct upload. The browser requests short lived parameters from the API and uploads the file to Cloudinary. Only the secure image URL and public ID are saved with the event; no Cloudinary secret is shipped to the client.

## Commands

```powershell
npm run dev -- --port 3001
npm run lint
npm run build
npm run start -- --port 3001
```

## Structure

- `app/(public)`: landing, catalog, event detail, auth, and attendee ticket pages.
- `app/admin`: protected organizer pages.
- `app/api/auth` and `app/api/backend`: cookie authentication and API proxy.
- `src/components`: shared UI and page flows.
- `src/lib/api-types.ts`: generated from the live API `/docs-json` with `openapi-typescript`.
- `src/lib/api.ts`: typed path and normalized error helpers.
- `public/fonts`: self hosted Bricolage Grotesque, DM Sans, and JetBrains Mono loaded through `next/font/local`.

## Assumptions and API notes

- All displayed dates use `Asia/Kolkata` as the campus default. Date inputs use the browser's local time zone and are sent as ISO timestamps.
- The API accepts bookings for paid events but has no payment endpoint. The UI says payment is arranged by the organizer.
- The API does not expose a public aggregate savings endpoint, so the landing page omits that stat band for anonymous visitors.
- The backend `/docs-json` defines request DTOs but few response schemas; `src/lib/types.ts` describes response bodies while `api-types.ts` provides generated path typing.
- The 400 booking Fest exists only after explicitly running the demo seed against an empty database.
- SMTP is optional on the API. Without SMTP configuration, messages are written to its Outbox fallback.

## Verification

`npm run build` and `npm run lint` pass. HTTP smoke tests verified public routes, cookie login and role redirects, the seeded planner, seat booking, food order, QR generation, check-in, and food collection through the client proxy. The browser automation surface was unavailable in this environment, so a visual viewport and Lighthouse pass remain to be done in a local browser.
