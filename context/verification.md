# Verification log (2026-11-15)

## Neon development database

- Connected to the supplied direct Neon URL on branch `development`.
- Before reset, `public` held 21 tables for a different application, including 7 users and unrelated issues/posts. Reset `public` with `scripts/reset-development-db.mjs --reset-public-schema` as requested. The script checks the exact host, database, and branch marker before running.
- Regenerated and applied `prisma/migrations/20261115000000_initial/migration.sql` with `npx prisma migrate deploy` using the direct connection.
- `npx prisma migrate status` confirmed that the database schema is up to date.
- `npm run db:seed` succeeded. Verified `public` has 2 events, 400 bookings, 400 food orders, 400 order items, 401 users, 12 calibration rows, 3 equipment rows, and 2 parking zones.
- The Neon development credentials and Cloudinary credentials are in gitignored `server/.env`. No credentials are in tracked files.

## Application

- `npx prisma validate`, `npx prisma generate`, `npm run build`, `npx tsc --noEmit`, and `npm test` passed.
- `npm run start:prod` started against Neon; `/api/health` returned `ok`, `/docs` returned HTTP 200, admin login worked, and `/api/admin/events` returned 2 events.
- `npm run start:dev` compiled with 0 errors, started against Neon, and returned healthy `/api/health` and HTTP 200 at `/docs`.
- The seeded Fest planner returned 400 booked, 288 likely attendance, 337 recommended meals, and 33.54 kW peak load.
- Cloudinary smoke test uploaded a generated PNG through `POST /api/events/:id/media`, verified the persisted Cloudinary URL in public event detail, then removed it through `DELETE /api/events/:id/media`.
- Repeated the Cloudinary upload/removal smoke test after the final media cleanup change; both steps passed.

## Isolated e2e test schema

- Created and migrated `eventsense_test` on the same Neon development database, then ran `npm run test:e2e` with `TEST_DATABASE_URL` pointing there.
- The first e2e run exposed a real locking defect: unqualified raw SQL selected `public.Event` while Prisma models used `eventsense_test`. Fixed `common/lock-event.ts` to qualify the configured schema.
- The final e2e run passed both tests in 93 seconds. The 20-way booking test persisted exactly 5 `CONFIRMED` and 15 `WAITLISTED`; the register/login → booking → food order → check-in → food collection → close → report flow passed.
- Dropped `eventsense_test` after verification. The demo data in `public` remains.

## Remaining work

- The Cloudinary smoke test exercised a real upload and removal, but no user-supplied image was uploaded.
- SMTP delivery was not exercised because SMTP credentials were not supplied; the Outbox fallback remains available.
- The server was started locally for verification. It has not been deployed.

## Client and API integration (2026-11-15)

- Added the Next.js 16 client in `client`, its full source specification in `context/client-specification.txt`, and setup notes in `client/README.md`.
- Generated `client/src/lib/api-types.ts` from the running Nest Swagger JSON. Added a same origin cookie proxy and public, attendee, and organizer routes.
- Added migration `20261115010000_food_images` on the supplied Neon development branch. Food items now have optional Cloudinary image URLs. Added signed direct upload parameters, an attendee list endpoint, richer savings and event list responses, and config update endpoints for the organizer editor.
- `client npm run build` passed. The server build passed after the integration changes.
- HTTP smoke checks returned 200 for `/`, `/events`, `/login`, and the protected planner and ticket pages. `/admin` redirected unauthenticated visitors.
- Cookie login through the client proxy returned the seeded admin. The 400 booking Fest planner returned 288 likely attendance, 337 recommended meals, 2 parking zones, and 16 power points.
- Registered a new attendee through the client, booked a seat and parking, and retrieved a QR ticket. A Neon latency issue initially caused food ordering to time out; increased the Prisma food transaction timeout to 60 seconds and verified a food order succeeds. Scanned an existing attendee ticket for check-in and collected one meal through the client proxy.
- Computer use had no browser or native app surface available, so viewport screenshots and Lighthouse could not be run here. No deployment was performed.

## Empty Neon reset and local startup (2026-11-15)

- Diagnosed `EADDRINUSE`: a separate Next.js `next start` process, not NestJS, was listening on port 3000. Stopped the API watcher left from verification; kept the separate client process untouched.
- Verified `.env` targets the exact supplied Neon `development` branch, direct host, database `neondb`, and pooled runtime host. Ran the guarded `server/scripts/reset-development-db.mjs --reset-public-schema` against that development branch.
- Applied `20261115000000_initial` and `20261115010000_food_images` with `npx prisma migrate deploy` using the direct URL. `prisma migrate status` reported up to date. Prisma Client generation and the Nest build passed.
- Confirmed zero rows in User, Event, Booking, FoodOrder, FoodOrderItem, Notification, Outbox, CalibrationStat, and EventReport. No seed was run, so the earlier demo credentials and events are absent.
- Set local `server/.env` to `PORT=3002` and `client/.env.local` to `NEXT_PUBLIC_API_URL=http://localhost:3002/api`. Updated examples and docs. The user's existing VS Code `npm run start:dev` watcher picked up the new port and is the API listener on 3002; separate verification watchers were stopped. `/api/health` returned `ok`, `/docs-json` returned 200, and `/api/events` returned an empty list. The client proxy on port 3001 returned `ok` from the API health endpoint and an empty event list before its verification process was stopped.
