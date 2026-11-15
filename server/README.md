# EventSense API

NestJS 12, Prisma 6, PostgreSQL. All HTTP routes use `/api`; OpenAPI is at `/docs`.

## Setup

1. Copy `.env.example` to `.env` and set the pooled PostgreSQL URL, direct migration URL, and strong secrets.
2. `npm ci --legacy-peer-deps`
3. `npx prisma migrate deploy`
4. `npm run db:seed` on a fresh database only
5. `npm run start:dev`

Run `npm test` for forecast unit tests. For the database-backed suite, migrate a separate test database or schema, set `TEST_DATABASE_URL` to its URL, then run `npm run test:e2e`. The API requires PostgreSQL at startup, including `/api/health`.

The supplied Neon development branch has already been migrated and seeded. Its connection strings and Cloudinary credentials are stored only in gitignored `server/.env`. Do not rerun the seed there without first clearing its existing demo data.

The demo admin is `admin@eventsense.dev` / `Admin@123`. Change this password outside local development. The seed creates five login-ready students with password `Student@123`, 395 additional demo attendees, and two events. Run seed once against a fresh database.

## Environment

`DATABASE_URL` is the pooled PostgreSQL connection string for the API. `DATABASE_URL_UNPOOLED` is the direct connection used by Prisma migrations. `JWT_SECRET` signs bearer tokens. `JWT_EXPIRES_IN` defaults to `1d`. `CLIENT_URL` is the allowed browser origin. `ADMIN_SIGNUP_CODE` permits an admin registration. `PORT` defaults to `3000`. Set all `SMTP_*` variables to send email; without an SMTP host/from address, emails are logged and saved in `Outbox`. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to enable event image uploads.

## Routes

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/auth/register`, `/api/auth/login` | Public |
| GET | `/api/auth/me` | Signed in |
| GET | `/api/health` | Public |
| POST, PATCH | `/api/events`, `/api/events/:id` | Admin owner |
| POST | `/api/events/:id/publish` | Admin owner |
| GET | `/api/events`, `/api/events/:id` | Public |
| GET | `/api/admin/events` | Admin |
| POST, DELETE | `/api/events/:id/media` | Admin owner; multipart image upload or removal |
| POST, GET, DELETE | `/api/events/:id/food-items`, `/parking-zones`, `/equipment` | Admin writes; public reads |
| POST | `/api/events/:id/bookings` | Signed in |
| GET | `/api/me/bookings`, `/api/bookings/:id/ticket` | Booking owner |
| DELETE | `/api/bookings/:id` | Booking owner |
| PUT, GET | `/api/bookings/:id/food-order` | Booking owner |
| GET | `/api/events/:id/planner` | Admin owner |
| POST | `/api/checkin`, `/api/food-collect` | Admin owner |
| POST, GET | `/api/events/:id/notifications` | Admin owner writes; active booker reads |
| POST, GET | `/api/events/:id/close`, `/api/events/:id/report` | Admin owner |
| GET | `/api/admin/savings` | Admin |

## Forecast and assumptions

Effective capacity is `min(capacity, safetyLimit)`. The attendance likely estimate is `round(booked × showRate + booked × walkInRate)`, with a 1.65 standard deviation band on the show count. Free defaults are 0.62 show, 0.10 walk-in, and 0.75 food claim; paid defaults are 0.93, 0.05, and 0.85. Saved calibration values override them.

Food recommendations use `ceil((ordered × claimRate + proportional walk-ins × 0.5) × 1.05)`. The planner's `mealsSaved` compares this recommendation with a manual guess of one meal per confirmed booking. At closure, actual `mealsSaved` is `max(0, booked - total collected meals)`. This is an estimate, not a financial ledger. `estimatedCostSaved` uses the unit cost only where provided. Power samples every 30 minutes; occupancy-scaled equipment uses at least 30% load.

Booking and food stock operations lock the event row in PostgreSQL. A waitlisted booking can keep a preferred parking zone, but promotion drops that preference if the zone has filled. Cancellation keeps the unique event/user booking record, so the same account cannot rebook after cancellation. Seat release runs once and clears `seatReleaseAt`. Only `CONFIRMED` tickets can be checked in, and food is collectable after check-in.

The model has no walk-in record, so observed walk-in rate remains at its prior calibration value on closure. Passwords and tokens are never returned together; ticket QR encodes a random token. The development seed deliberately creates hundreds of users and orders and can take a little time.

Event media is a single cover image per event. The upload accepts JPEG, PNG, or WebP up to 5 MB, stores it in Cloudinary, and saves its HTTPS URL and public ID on the Event row. Replacing or deleting an image removes the prior asset. Public event responses include `imageUrl`.

## Demo flow

1. Log in as the demo admin and use the access token in Swagger.
2. Fetch `GET /api/admin/events`; open the Campus Innovation Fest planner.
3. Get a student booking from `GET /api/me/bookings` using a student login, then present the ticket QR token to the admin.
4. Admin sends `POST /api/checkin`, then `POST /api/events/:id/close`.
5. Admin opens `GET /api/events/:id/report` and `GET /api/admin/savings`.
