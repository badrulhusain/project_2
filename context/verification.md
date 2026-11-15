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
