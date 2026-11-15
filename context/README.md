# EventSense handoff context

Read `server/README.md` for setup and route contracts. `specification.txt` is the user's full original specification; `spec-summary.md` records the main requirements and current implementation state.

The server is an ESM NestJS 12 project (`.js` suffixes in TypeScript imports), Prisma 6 with PostgreSQL, and Vitest. Backend source is in `server/src`, schema and seed in `server/prisma`.

The Next.js 16 client is in `client`. Read `client/README.md` for setup, routes, assumptions, and verified flows. `client-specification.txt` is the full user supplied client specification. The client uses a same origin JWT cookie proxy, generated OpenAPI path types, Cloudinary signed direct uploads, and self hosted fonts. The current local ports are API 3002 and client 3001; a separate Next.js process occupies port 3000.

On 2026-11-15, the user requested an empty Neon database. `server/scripts/reset-development-db.mjs --reset-public-schema` was run against the guarded `development` branch, then both checked-in migrations were deployed. No seed was run. All application tables are empty. The API uses port 3002 locally because a Next.js process listens on 3000. See `verification.md` for the checks.
