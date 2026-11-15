# Specification and implementation notes

Product: campus events with seat booking, waitlist, food preorders, parking, QR check-in/collection, forecast, notifications, and post-event calibration. Roles: ADMIN and USER. Admins may modify only their own events. API prefix `/api`; Swagger `/docs`.

Modules under `server/src`: auth, users, events, bookings, food, parking, equipment, planner, checkin, notifications, reports, calibration, health, common, prisma, media. The Prisma schema includes all requested entities and foreign-key indexes plus event image URL/public ID. `planner/forecast.ts` holds the pure calculation functions and default rates.

Important constraints: booking and food order transactions lock the event row using the schema-qualified helper in `common/lock-event.ts`. Booking uses effective capacity `min(capacity,safetyLimit)`. Notification and seat-release jobs run each minute. Without SMTP, email is logged and saved in Outbox. `server/.env` is gitignored and currently points at the supplied Neon development branch; use `DATABASE_URL_UNPOOLED` for migrations and the pooled `DATABASE_URL` for runtime.

Check `context/verification.md` for actual verification results and any remaining gaps. Do not assume a passing build or runtime verification unless recorded there.
